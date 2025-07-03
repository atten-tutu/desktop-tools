import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  desktopCapturer,
  nativeTheme,
  screen,
} from 'electron';

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'fs';
import { session } from 'electron';

// @ts-ignore
const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log('preload path:', path.join(__dirname, 'preload.mjs'));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;
let mainWindow: BrowserWindow | null = null;
let floatBallWindow: BrowserWindow | null = null;
let win: BrowserWindow | null;

ipcMain.on('save-screenshot', (event, base64: string) => {
  const imageBuffer = Buffer.from(
    base64.replace(/^data:image\/\w+;base64,/, ''),
    'base64'
  );
  const savePath = path.join(app.getPath('desktop'), 'screenshot.png');

  fs.writeFile(savePath, imageBuffer, (err) => {
    if (err) {
      console.error('保存截图失败：', err);
    } else {
      console.log('截图已保存至：', savePath);
    }
  });
});
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL); // 自定义页面路径
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

function createFloatBallWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

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
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  floatBallWindow.loadURL(`${VITE_DEV_SERVER_URL}/float_ball`);
}
ipcMain.handle('minimize-main-window', () => {
  if (mainWindow) mainWindow.minimize();
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
  }
});

// ✅ 注册快捷键，控制窗口显隐
app.whenReady().then(() => {
  createMainWindow();
  createFloatBallWindow();

  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ['screen'] }).then((sources) => {
      callback({ video: sources[0], audio: 'loopback' });
    });
  });

  globalShortcut.register('CommandOrControl+Shift+P', () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
  ipcMain.on('toggle-main-window', () => {
    if (!mainWindow) return;
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
  ipcMain.on('open-plugin', (event, pluginName: string) => {
    openPluginWindow(pluginName);
    console.log(
      `Opened plugin: ${pluginName}`,
      path.join(process.env.APP_ROOT!, 'plugins', pluginName, 'index.html')
    );
  });
});
let editorWindow: BrowserWindow | null = null;
ipcMain.handle(
  'create-floating-image-window',
  async (_event, base64Image: string) => {
    console.log(base64Image);
    const imageWin = new BrowserWindow({
      width: 400, // 初始宽高可以动态设置
      height: 300,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      focusable: false, // ➜ 不抢焦点，点击也不会把它“切后台”
      resizable: true,
      movable: true,
      skipTaskbar: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    imageWin.setAlwaysOnTop(true, 'screen-saver');

    // 加载贴图页面（你可以用一个单独路由如 /snipaste 实现一个 ImagePreview 页面）
    await imageWin.loadURL('http://localhost:5173/snipaste');
    imageWin.webContents.send('load-image', base64Image);
    imageWin.webContents.once('did-finish-load', () => {});
  }
);

ipcMain.handle('open-screenshot-editor', async (event, base64Image: string) => {
  console.log(base64Image);
  editorWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
    },
  });
  ipcMain.on('screenshot-cancel', () => {
    editorWindow?.close();
  });
  // 加载你的截图编辑器页面（独立 html）
  await editorWindow.loadURL('http://localhost:5173/screen_shot');

  editorWindow?.webContents.send('load-image', base64Image);

  // 页面加载后传入 base64 图片
  editorWindow.webContents.once('did-finish-load', () => {});

  return true;
});
ipcMain.handle('get-sources', async () => {
  const sources = await desktopCapturer.getSources({
    types: ['screen', 'window'],
  });
  return sources;
});

// ✅ 退出时清理注册的快捷键
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

function openPluginWindow(pluginName: string) {
  const pluginHtml = path.join(
    process.env.APP_ROOT!,
    'plugins',
    pluginName,
    'index.html'
  );
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  win.loadFile(pluginHtml);
}
