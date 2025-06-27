import { app, BrowserWindow, globalShortcut, ipcMain, screen  } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'fs';

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
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL) // 自定义页面路径
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
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
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  floatBallWindow.loadURL(`${VITE_DEV_SERVER_URL}/float_ball`)

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
  createMainWindow()
  createFloatBallWindow()

  globalShortcut.register('CommandOrControl+Shift+P', () => {
    if (!mainWindow) return
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
      mainWindow.focus()
    }
  })
  ipcMain.on('toggle-main-window', () => {
    if (!mainWindow) return
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
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
      preload: path.join(__dirname, 'preload.js'),
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

