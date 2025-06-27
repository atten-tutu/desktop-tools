import { app, BrowserWindow, globalShortcut, ipcMain, screen } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "fs";
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let mainWindow = null;
let floatBallWindow = null;
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, "index.html"));
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
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  floatBallWindow.loadURL(`${VITE_DEV_SERVER_URL}/float_ball`);
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) ;
});
app.whenReady().then(() => {
  createMainWindow();
  createFloatBallWindow();
  globalShortcut.register("CommandOrControl+Shift+P", () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
  ipcMain.on("toggle-main-window", () => {
    if (!mainWindow) return;
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
  ipcMain.on("open-plugin", (event, pluginName) => {
    openPluginWindow(pluginName);
    console.log(`Opened plugin: ${pluginName}`, path.join(process.env.APP_ROOT, "plugins", pluginName, "index.html"));
  });
  ipcMain.on("search-plugins", async (event) => {
    const plugins = getAllPlugins();
    event.returnValue = plugins;
    console.log(`Searched plugins: ${plugins.map((p) => p.name).join(", ")}`);
  });
});
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
function openPluginWindow(pluginName) {
  const pluginHtml = path.join(process.env.APP_ROOT, "plugins", pluginName, "index.html");
  const win2 = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win2.loadFile(pluginHtml);
}
function getAllPlugins() {
  const pluginsDir = path.join(process.env.APP_ROOT, "plugins");
  const result = [];
  const dirs = fs.readdirSync(pluginsDir, { withFileTypes: true }).filter((dirent) => dirent.isDirectory());
  for (const dirent of dirs) {
    const pluginJsonPath = path.join(pluginsDir, dirent.name, "plugin.json");
    if (fs.existsSync(pluginJsonPath)) {
      const json = JSON.parse(fs.readFileSync(pluginJsonPath, "utf-8"));
      result.push({
        name: json.name,
        icon: json.icon,
        dir: dirent.name
      });
    }
  }
  return result;
}
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
