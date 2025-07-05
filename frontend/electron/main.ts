import { app, BrowserWindow, globalShortcut, ipcMain, screen, dialog } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'fs';
import { initialize, enable } from '@electron/remote/main';
import { networkInterfaces } from 'os';
import { hostname } from 'os';

// 导入 Express 相关模块
import express from 'express';
import { Server as HttpServer } from 'http';
import multer from 'multer';
import cors from 'cors';

// LAN 共享服务器类
class LanShareServer {
  private app: express.Application;
  private server: HttpServer | null = null;
  private port: number = 3000;
  private savePath: string = '';
  private isRunning: boolean = false;

  constructor() {
    this.app = express();
    
    // 启用 CORS
    this.app.use(cors({
      origin: '*', // 允许所有来源
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    // 配置基本中间件
    this.app.use(express.json());
    
    // 配置健康检查端点
    this.app.get('/health', (req, res) => {
      res.status(200).json({ 
        status: 'ok',
        serverTime: new Date().toISOString(),
        version: '1.0.0'
      });
    });
    
    // 添加测试端点
    this.app.get('/test', (req, res) => {
      res.status(200).json({
        message: 'Test endpoint is working',
        ip: this.getLocalIpAddress(),
        port: this.port,
        time: new Date().toISOString()
      });
    });
  }

  /**
   * 配置文件上传功能
   */
  private configureFileUpload(): void {
    if (!this.savePath) {
      console.warn('Save path not set, file upload disabled');
      return;
    }

    // 确保保存路径存在
    if (!fs.existsSync(this.savePath)) {
      fs.mkdirSync(this.savePath, { recursive: true });
    }

    // 配置文件存储
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.savePath);
      },
      filename: (req, file, cb) => {
        // 生成唯一文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
      }
    });

    // 创建 multer 实例
    const upload = multer({ 
      storage,
      limits: { fileSize: 1024 * 1024 * 500 } // 500MB 限制
    });

    // 文件上传端点
    this.app.post('/upload', upload.single('file'), (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // 返回文件信息
      res.status(200).json({
        success: true,
        file: {
          originalName: req.file.originalname,
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size,
          url: `http://${this.getLocalIpAddress()}:${this.port}/files/${req.file.filename}`
        }
      });
    });
  }

  /**
   * 获取本机 IP 地址
   */
  private getLocalIpAddress(): string {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      const net = nets[name];
      if (net) {
        for (const netInterface of net) {
          // 跳过内部 IP 和非 IPv4 地址
          if (netInterface.family === 'IPv4' && !netInterface.internal) {
            return netInterface.address;
          }
        }
      }
    }
    return 'localhost';
  }

  /**
   * 设置服务器端口
   * @param port 端口号
   */
  public setPort(port: number): void {
    this.port = port;
  }

  /**
   * 设置文件保存路径
   * @param savePath 保存路径
   */
  public setSavePath(savePath: string): void {
    this.savePath = savePath;
    
    // 确保保存路径存在
    if (savePath && !fs.existsSync(savePath)) {
      fs.mkdirSync(savePath, { recursive: true });
    }
    
    // 如果服务器已运行，更新静态文件服务
    if (this.isRunning && savePath) {
      this.app.use('/files', express.static(savePath));
    }
  }

  /**
   * 启动服务器
   * @returns 是否成功启动
   */
  public async start(): Promise<boolean> {
    if (this.isRunning) {
      console.log('Server is already running');
      return true;
    }
    
    try {
      // 配置文件上传功能
      this.configureFileUpload();
      
      // 如果保存路径已设置，配置静态文件服务
      if (this.savePath) {
        this.app.use('/files', express.static(this.savePath));
      }
      
      // 创建 HTTP 服务器
      this.server = new HttpServer(this.app);
      
      // 启动服务器
      return new Promise((resolve) => {
        this.server?.listen(this.port, '0.0.0.0', () => {
          console.log(`LAN Share server running on port ${this.port}, bound to 0.0.0.0`);
          this.isRunning = true;
          
          // 打印服务器信息
          const ip = this.getLocalIpAddress();
          console.log(`Server accessible at: http://${ip}:${this.port}/`);
          console.log(`Test endpoint: http://${ip}:${this.port}/test`);
          
          resolve(true);
        });
      });
    } catch (error) {
      console.error('Failed to start LAN Share server:', error);
      this.isRunning = false;
      return false;
    }
  }

  /**
   * 停止服务器
   * @returns 是否成功停止
   */
  public async stop(): Promise<boolean> {
    if (!this.isRunning || !this.server) {
      console.log('Server is not running');
      this.isRunning = false;
      return true;
    }
    
    try {
      return new Promise((resolve) => {
        this.server?.close(() => {
          console.log('LAN Share server stopped');
          this.isRunning = false;
          this.server = null;
          resolve(true);
        });
      });
    } catch (error) {
      console.error('Failed to stop LAN Share server:', error);
      // 即使出错，也将状态设置为已停止
      this.isRunning = false;
      this.server = null;
      return false;
    }
  }

  /**
   * 获取服务器运行状态
   * @returns 服务器是否正在运行
   */
  public isServiceRunning(): boolean {
    return this.isRunning;
  }
}

// 创建 LAN 共享服务器实例
const lanShareServer = new LanShareServer();

initialize();

// @ts-ignore
const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST
let mainWindow: BrowserWindow | null = null
let floatBallWindow: BrowserWindow | null = null
let win: BrowserWindow | null

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    autoHideMenuBar: true, // 隐藏菜单栏
    icon: path.join(process.env.APP_ROOT!, 'app-icon.ico'), // 设置应用图标
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL) // 自定义页面路径
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
  
  // 设置主窗口事件监听
  setupMainWindowEvents()
}

function createFloatBallWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  floatBallWindow = new BrowserWindow({
    width: 100,
    height: 100,
    x: width - 120,
    y: height - 120,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false, 
    skipTaskbar: true,
    resizable: false,
    transparent: true,
    backgroundColor: '#00000000', // 完全透明的背景
    show: false, // 初始不显示
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // 启用 remote 模块
  enable(floatBallWindow.webContents);

  // 修改为加载独立的HTML文件
  if (VITE_DEV_SERVER_URL) {
    // 开发环境使用
    floatBallWindow.loadFile(path.join(process.env.APP_ROOT!, 'float-ball.html'))
  } else {
    // 生产环境使用
    floatBallWindow.loadFile(path.join(RENDERER_DIST, 'float-ball.html'))
  }
  
  // 窗口准备好后显示
  floatBallWindow.once('ready-to-show', () => {
    floatBallWindow?.show()
  })
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
 
  }
})

// ✅ 注册快捷键，控制窗口显隐
app.whenReady().then(() => {
  // 设置应用图标
  const iconPath = path.join(process.env.APP_ROOT!, 'app-icon.ico');
  if (fs.existsSync(iconPath)) {
    app.setAppUserModelId('com.desktop.tools');
  }
  
  createMainWindow()
  createFloatBallWindow()

  globalShortcut.register('CommandOrControl+Shift+P', () => {
    if (!mainWindow) return
    if (mainWindow.isVisible()) {
      mainWindow.hide()
      showFloatBall()
    } else {
      mainWindow.show()
      mainWindow.focus()
      hideFloatBall()
    }
  })
  
  ipcMain.on('toggle-main-window', () => {
    if (!mainWindow) return
    if (mainWindow.isVisible()) {
      mainWindow.hide()
      showFloatBall()
    } else {
      mainWindow.show()
      mainWindow.focus()
      hideFloatBall()
    }
  })
  
  ipcMain.on('hide-float-ball', () => {
    hideFloatBall()
  })
  
  ipcMain.on('show-float-ball', () => {
    showFloatBall()
  })
  
  ipcMain.on('open-plugin', (event, pluginName: string) => {
    openPluginWindow(pluginName)
    console.log(`Opened plugin: ${pluginName}`, path.join(process.env.APP_ROOT!, 'plugins', pluginName, 'index.html'))
  })
  ipcMain.on('search-plugins', async (event) => {
    const plugins = getAllPlugins();
    event.returnValue = plugins;
    console.log(`Searched plugins: ${plugins.map(p => p.name).join(', ')}`);
  });
    
})

// ✅ 退出时清理注册的快捷键
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

function openPluginWindow(pluginName: string) {
  const pluginHtml = path.join(process.env.APP_ROOT!, 'plugins', pluginName, 'index.html');
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.loadFile(pluginHtml);
}

function getAllPlugins() {
  const pluginsDir = path.join(process.env.APP_ROOT!, 'plugins');
  const result: { name: string; icon: string; dir: string; iconDataUrl?: string }[] = [];
  const dirs = fs.readdirSync(pluginsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory());
  for (const dirent of dirs) {
    const pluginJsonPath = path.join(pluginsDir, dirent.name, 'plugin.json');
    if (fs.existsSync(pluginJsonPath)) {
      const json = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));
      let iconDataUrl = '';
      if (json.icon) {
        const iconPath = path.join(pluginsDir, dirent.name, json.icon);
        if (fs.existsSync(iconPath)) {
          const ext = path.extname(iconPath).slice(1) || 'png';
          const fileData = fs.readFileSync(iconPath);
          const base64 = fileData.toString('base64');
          iconDataUrl = `data:image/${ext};base64,${base64}`;
        }
      }
      result.push({
        name: json.name,
        icon: json.icon,
        dir: dirent.name,
        iconDataUrl,
      });
    }
  }
  return result;
}

// 显示悬浮球
function showFloatBall() {
  if (floatBallWindow && !floatBallWindow.isVisible()) {
    floatBallWindow.show()
  }
}

// 隐藏悬浮球
function hideFloatBall() {
  if (floatBallWindow && floatBallWindow.isVisible()) {
    floatBallWindow.hide()
  }
}

// 监听主窗口关闭事件
function setupMainWindowEvents() {
  if (!mainWindow) return
  
  mainWindow.on('close', (event) => {
    // 阻止默认关闭行为
    event.preventDefault()
    mainWindow?.hide()
    showFloatBall()
  })
  
  mainWindow.on('hide', () => {
    showFloatBall()
  })
  
  mainWindow.on('show', () => {
    hideFloatBall()
  })
}

// 获取本机名称
ipcMain.handle('get-hostname', async () => {
  return hostname();
});

// 获取本机 IP 地址
ipcMain.handle('get-ip', async () => {
  const nets = networkInterfaces();
  const results = [];
  for (const name of Object.keys(nets)) {
    const net = nets[name];
    if (net) { // 确保 net 不为 undefined
      for (const n of net) {
        // 只处理 IPv4 地址
        if (n.family === 'IPv4' && !n.internal) {
          results.push(n.address);
        }
      }
    }
  }
  return results.length > 0 ? results[0] : 'No IP found';
});

// 选择目录
ipcMain.handle('select-directory', async () => {
  return dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory']
  });
});

// 获取下载文件夹路径
ipcMain.handle('get-downloads-path', async () => {
  return app.getPath('downloads');
});

// 添加 IPC 处理程序，用于与渲染进程通信
ipcMain.handle('lan-share-start', async (event, options: { port: number, savePath: string }) => {
  console.log(`Starting LAN Share server on port ${options.port} with save path ${options.savePath}`);
  lanShareServer.setPort(options.port);
  lanShareServer.setSavePath(options.savePath);
  const result = await lanShareServer.start();
  console.log(`LAN Share server start result: ${result}, isRunning: ${lanShareServer.isServiceRunning()}`);
  return result;
});

ipcMain.handle('lan-share-stop', async () => {
  console.log('Stopping LAN Share server');
  const result = await lanShareServer.stop();
  console.log(`LAN Share server stop result: ${result}, isRunning: ${lanShareServer.isServiceRunning()}`);
  return result;
});

ipcMain.handle('lan-share-status', () => {
  const status = lanShareServer.isServiceRunning();
  console.log(`LAN Share server status: ${status}`);
  return status;
});

// 获取已上传文件列表
ipcMain.handle('lan-share-files', async (event, dirPath: string) => {
  try {
    if (!fs.existsSync(dirPath)) {
      return { success: false, error: 'Directory does not exist', files: [] };
    }
    
    const files = fs.readdirSync(dirPath)
      .filter(file => {
        const filePath = path.join(dirPath, file);
        return fs.statSync(filePath).isFile();
      })
      .map(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          lastModified: stats.mtime.toISOString()
        };
      });
      
    return { success: true, files };
  } catch (error) {
    console.error('Error getting file list:', error);
    return { success: false, error: String(error), files: [] };
  }
});

