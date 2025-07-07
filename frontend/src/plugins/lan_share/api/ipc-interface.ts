import { ipcRenderer } from 'electron';

/**
 * LAN 共享服务器 IPC 接口
 * 提供与主进程通信的方法
 */
export class LanShareIpcInterface {
  /**
   * 启动服务器
   * @param options 服务器配置选项
   * @returns 是否成功启动
   */
  async startService(options: { port: number, savePath: string, deviceName: string }): Promise<boolean> {
    try {
      return await ipcRenderer.invoke('lan-share-start', options);
    } catch (error) {
      console.error('Failed to start LAN Share service:', error);
      return false;
    }
  }

  /**
   * 停止服务器
   * @returns 是否成功停止
   */
  async stopService(): Promise<boolean> {
    try {
      return await ipcRenderer.invoke('lan-share-stop');
    } catch (error) {
      console.error('Failed to stop LAN Share service:', error);
      return false;
    }
  }

  /**
   * 获取服务器状态
   * @returns 服务器是否正在运行
   */
  async getServiceStatus(): Promise<boolean> {
    try {
      return await ipcRenderer.invoke('lan-share-status');
    } catch (error) {
      console.error('Failed to get LAN Share service status:', error);
      return false;
    }
  }

  /**
   * 获取服务器 URL
   * @returns 服务器 URL
   */
  async getServerUrl(): Promise<string> {
    try {
      return await ipcRenderer.invoke('lan-share-url');
    } catch (error) {
      console.error('Failed to get LAN Share server URL:', error);
      return '';
    }
  }

  /**
   * 获取已上传文件列表
   * @param dirPath 目录路径
   * @returns 文件列表信息
   */
  async getFileList(dirPath: string): Promise<{ success: boolean; files: any[]; error?: string }> {
    try {
      return await ipcRenderer.invoke('lan-share-files', dirPath);
    } catch (error) {
      console.error('Failed to get file list:', error);
      return { success: false, error: String(error), files: [] };
    }
  }

  /**
   * 获取本机名称
   * @returns 本机名称
   */
  async getHostname(): Promise<string> {
    try {
      return await ipcRenderer.invoke('get-hostname');
    } catch (error) {
      console.error('Failed to get hostname:', error);
      return 'Unknown';
    }
  }

  /**
   * 获取本机 IP 地址
   * @returns 本机 IP 地址
   */
  async getIp(): Promise<string> {
    try {
      return await ipcRenderer.invoke('get-ip');
    } catch (error) {
      console.error('Failed to get IP address:', error);
      return 'Unknown';
    }
  }

  /**
   * 选择目录
   * @returns 选择的目录路径
   */
  async selectDirectory(): Promise<string> {
    try {
      const result = await ipcRenderer.invoke('select-directory');
      if (result.canceled) {
        return '';
      }
      return result.filePaths[0];
    } catch (error) {
      console.error('Failed to select directory:', error);
      return '';
    }
  }

  /**
   * 获取下载文件夹路径
   * @returns 下载文件夹路径
   */
  async getDownloadsPath(): Promise<string> {
    try {
      return await ipcRenderer.invoke('get-downloads-path');
    } catch (error) {
      console.error('Failed to get downloads path:', error);
      return '';
    }
  }

  /**
   * 设置设备名称
   * @param name 设备名称
   * @returns 设置结果
   */
  async setDeviceName(name: string): Promise<{ success: boolean; error?: string }> {
    try {
      return await ipcRenderer.invoke('lan-share-set-device-name', name);
    } catch (error) {
      console.error('Failed to set device name:', error);
      return { success: false, error: String(error) };
    }
  }
}

// 导出单例
export const lanShareIpc = new LanShareIpcInterface(); 