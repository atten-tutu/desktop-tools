import { ipcMain } from 'electron';
import { LanShareServer } from './lan-share-server';
import path from 'path';

/**
 * 设置 LAN 共享服务器的 IPC 处理
 * @param lanShareServer LAN 共享服务器实例
 */
export function setupLanShareIPC(lanShareServer: LanShareServer): void {
  // 启动服务器
  ipcMain.handle('lan-share-start', async (event, options: { port: number, savePath: string, deviceName: string }) => {
    console.log(`Starting LAN Share server on port ${options.port} with save path ${options.savePath}`);
    lanShareServer.setPort(options.port);
    lanShareServer.setSavePath(options.savePath);
    
    // 设置设备名称
    if (options.deviceName) {
      lanShareServer.setDeviceName(options.deviceName);
    }
    
    const result = await lanShareServer.start();
    console.log(`LAN Share server start result: ${result}, isRunning: ${lanShareServer.isServiceRunning()}`);
    return result;
  });

  // 停止服务器
  ipcMain.handle('lan-share-stop', async () => {
    console.log('Stopping LAN Share server');
    const result = await lanShareServer.stop();
    console.log(`LAN Share server stop result: ${result}, isRunning: ${lanShareServer.isServiceRunning()}`);
    return result;
  });

  // 获取服务器状态
  ipcMain.handle('lan-share-status', () => {
    const status = lanShareServer.isServiceRunning();
    console.log(`LAN Share server status: ${status}`);
    return status;
  });

  // 获取已上传文件列表
  ipcMain.handle('lan-share-files', async (event, dirPath: string) => {
    return lanShareServer.getFileList(dirPath);
  });

  // 获取服务器 URL
  ipcMain.handle('lan-share-url', () => {
    return lanShareServer.getServerUrl();
  });
  
  // 设置设备名称
  ipcMain.handle('lan-share-set-device-name', (event, name: string) => {
    try {
      lanShareServer.setDeviceName(name);
      return { success: true };
    } catch (error) {
      console.error('Error setting device name:', error);
      return { success: false, error: String(error) };
    }
  });
}

/**
 * 清理 LAN 共享服务器的 IPC 处理
 */
export function cleanupLanShareIPC(): void {
  ipcMain.removeHandler('lan-share-start');
  ipcMain.removeHandler('lan-share-stop');
  ipcMain.removeHandler('lan-share-status');
  ipcMain.removeHandler('lan-share-files');
  ipcMain.removeHandler('lan-share-url');
  ipcMain.removeHandler('lan-share-set-device-name');
} 