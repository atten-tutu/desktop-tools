// LAN Share API 封装
import { Message } from '@arco-design/web-react';
import { lanShareIpc } from './ipc-interface';
import type { Message as LanShareMessage } from './ipc-interface';
import { useTranslation } from '../../i18n/i18n';

// 设备信息类型
export interface DeviceInfo {
  id: string;
  name: string;
  ip: string;
  isOnline: boolean;
}

// 消息类型
export type MessageType = 'text' | 'file' | 'image';

// 消息状态
export type MessageStatus = 'success' | 'failed' | 'pending';

// 消息数据结构
export interface MessageData {
  id: string;
  content: string;
  type: MessageType;
  fileSize?: string;
  fileName?: string;
  timestamp: number;
  isOutgoing: boolean;
  status: MessageStatus;
  deviceName?: string;
}

// 文件信息类型
export interface FileInfo {
  name: string;
  path: string;
  size: number;
  lastModified: string;
}

// API 类
class LanShareApi {
  private serviceRunning = false;
  private secretCode = '';
  private port = 3000;
  private savePath = '';
  private deviceName = '';
  
  // 获取本机名称
  async getHostname(): Promise<string> {
    return await lanShareIpc.getHostname();
  }
  
  // 获取本机 IP 地址
  async getIp(): Promise<string> {
    return await lanShareIpc.getIp();
  }
  
  // 获取服务状态
  async getServiceStatus(): Promise<boolean> {
    try {
      const status = await lanShareIpc.getServiceStatus();
      this.serviceRunning = status;
      console.log(`Current service status: ${status}`);
      return status;
    } catch (error) {
      console.error('Failed to get service status:', error);
      return false;
    }
  }
  
  // 设置暗号
  setSecretCode(code: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.secretCode = code;
      // TODO: 实际设置暗号的逻辑
      console.log(`Secret code set to: ${code}`);
      resolve(true);
    });
  }
  
  // 设置端口
  setPort(port: number): void {
    console.log(`Setting port to: ${port}`);
    this.port = port;
  }
  
  // 设置保存路径
  setSavePath(path: string): void {
    console.log(`Setting save path to: ${path}`);
    this.savePath = path;
  }
  
  // 设置设备名称
  setDeviceName(name: string): void {
    console.log(`Setting device name to: ${name}`);
    this.deviceName = name;
    
    // 如果服务已启动，更新设备名称
    if (this.serviceRunning) {
      lanShareIpc.setDeviceName(name).catch(error => {
        console.error('Failed to set device name:', error);
      });
    }
  }
  
  // 启动服务
  async startService(): Promise<boolean> {
    try {
      console.log(`Starting service with port: ${this.port}, savePath: ${this.savePath}, deviceName: ${this.deviceName}`);
      const result = await lanShareIpc.startService({
        port: this.port,
        savePath: this.savePath,
        deviceName: this.deviceName
      });
      this.serviceRunning = result;
      console.log(`Service started, result: ${result}, serviceRunning: ${this.serviceRunning}`);
      return result;
    } catch (error) {
      console.error('Failed to start service:', error);
      this.serviceRunning = false;
      return false;
    }
  }
  
  // 停止服务
  async stopService(): Promise<boolean> {
    try {
      const result = await lanShareIpc.stopService();
      // 修复逻辑错误：result 为 true 表示成功停止，此时 serviceRunning 应该为 false
      this.serviceRunning = false;
      console.log('Service stopped');
      return result;
    } catch (error) {
      console.error('Failed to stop service:', error);
      return false;
    }
  }
  
  // 发送消息
  sendMessage(message: string, devices: DeviceInfo[]): Promise<MessageData> {
    return new Promise((resolve) => {
      const msgData: MessageData = {
        id: Date.now().toString(),
        content: message,
        type: 'text',
        timestamp: Date.now(),
        isOutgoing: true,
        status: 'pending'
      };
      
      // TODO: 实际发送消息的逻辑
      console.log(`Sending message: ${message}`);
      console.log(`To devices: ${devices.map(d => d.name).join(', ')}`);
      
      // 模拟网络延迟
      setTimeout(() => {
        msgData.status = 'success';
        resolve(msgData);
      }, 1000);
    });
  }
  
  // 发送文件
  async sendFile(file: File, devices: DeviceInfo[]): Promise<MessageData> {
    try {
      // 检查服务是否运行
      const isRunning = await this.getServiceStatus();
      console.log(`Service running check before sending file: ${isRunning}`);
      
      if (!isRunning) {
        console.error('Cannot send file: Service is not running');
        throw new Error('Service is not running');
      }

      if (!file) {
        throw new Error('No file provided');
      }
      
      // 创建消息数据
      const msgData: MessageData = {
        id: Date.now().toString(),
        content: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: this.formatFileSize(file.size),
        type: file.type.startsWith('image/') ? 'image' : 'file',
        timestamp: Date.now(),
        isOutgoing: true,
        status: 'pending'
      };
      
      // 创建表单数据
      const formData = new FormData();
      formData.append('file', file);
      
      // 获取本机 IP
      const ip = await this.getIp();
      
      console.log(`Current port: ${this.port}, Service running: ${this.serviceRunning}`);
      console.log(`Uploading file to http://${ip}:${this.port}/upload`);
      
      // 先测试连接
      const testResult = await this.testServerConnection();
      console.log('Server connection test before upload:', testResult);
      
      if (!testResult.success) {
        throw new Error('Cannot connect to server');
      }
      
      // 也尝试使用 localhost
      let response;
      try {
        // 上传文件到服务器
        console.log(`Uploading file: ${file.name} (${this.formatFileSize(file.size)})`);
        response = await fetch(`http://${ip}:${this.port}/upload`, {
          method: 'POST',
          body: formData
        });
      } catch (error) {
        console.log('Trying with localhost instead');
        response = await fetch(`http://localhost:${this.port}/upload`, {
          method: 'POST',
          body: formData
        });
      }
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Upload result:', result);
      
      // 更新消息数据
      msgData.status = 'success';
      msgData.content = result.file.url; // 使用服务器返回的 URL
      
      return msgData;
    } catch (error) {
      console.error('Failed to send file:', error);
      return {
        id: Date.now().toString(),
        content: '',
        fileName: file ? file.name : 'unknown',
        fileSize: file ? this.formatFileSize(file.size) : '0 B',
        type: 'file',
        timestamp: Date.now(),
        isOutgoing: true,
        status: 'failed'
      };
    }
  }
  
  // 扫描局域网设备
  scanDevices(): Promise<DeviceInfo[]> {
    return new Promise((resolve) => {
      // TODO: 实际扫描设备的逻辑
      console.log('Scanning for devices...');
      
      // 模拟设备扫描结果
      setTimeout(() => {
        const devices: DeviceInfo[] = [
          {
            id: '1',
            name: 'Device 1',
            ip: '192.168.1.101',
            isOnline: true
          },
          {
            id: '2',
            name: 'Device 2',
            ip: '192.168.1.102',
            isOnline: true
          }
        ];
        resolve(devices);
      }, 1500);
    });
  }
  
  // 获取已上传文件列表
  async getFileList(): Promise<FileInfo[]> {
    try {
      if (!this.savePath) {
        console.error('Save path not set');
        return [];
      }
      
      const result = await lanShareIpc.getFileList(this.savePath);
      if (result.success) {
        return result.files;
      } else {
        console.error('Failed to get file list:', result.error);
        return [];
      }
    } catch (error) {
      console.error('Error getting file list:', error);
      return [];
    }
  }
  
  // 格式化文件大小
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }

  // 测试服务器连接
  async testServerConnection(): Promise<{ success: boolean, data?: any, error?: string }> {
    try {
      // 获取本机 IP
      const ip = await this.getIp();
      
      // 尝试使用 IP 地址
      try {
        console.log(`Testing connection to http://${ip}:${this.port}/test`);
        const response = await fetch(`http://${ip}:${this.port}/test`);
        if (response.ok) {
          const data = await response.json();
          console.log('Test successful with IP:', data);
          return { success: true, data };
        }
      } catch (ipError) {
        console.log('IP connection failed, trying localhost');
      }
      
      // 尝试使用 localhost
      try {
        console.log(`Testing connection to http://localhost:${this.port}/test`);
        const response = await fetch(`http://localhost:${this.port}/test`);
        if (response.ok) {
          const data = await response.json();
          console.log('Test successful with localhost:', data);
          return { success: true, data };
        }
      } catch (localhostError) {
        console.log('Localhost connection failed');
        throw new Error('Both IP and localhost connections failed');
      }
      
      return { success: false, error: 'Failed to connect to server' };
    } catch (error) {
      console.error('Test server connection failed:', error);
      return { success: false, error: String(error) };
    }
  }
}

// 导出单例
export const lanShareApi = new LanShareApi(); 