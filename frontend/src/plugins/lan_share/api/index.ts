// LAN Share API 封装
import { Message } from '@arco-design/web-react';
import { ipcRenderer } from 'electron';

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

// API 类
class LanShareApi {
  private serviceRunning = false;
  private secretCode = '';
  
  // 获取本机名称
  getHostname(): Promise<string> {
    return ipcRenderer.invoke('get-hostname');
  }
  
  // 获取本机 IP 地址
  getIp(): Promise<string> {
    return ipcRenderer.invoke('get-ip');
  }
  
  // 获取服务状态
  getServiceStatus(): boolean {
    return this.serviceRunning;
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
  
  // 启动服务
  startService(): Promise<boolean> {
    return new Promise((resolve) => {
      // TODO: 实际启动服务的逻辑
      this.serviceRunning = true;
      console.log('Service started');
      resolve(true);
    });
  }
  
  // 停止服务
  stopService(): Promise<boolean> {
    return new Promise((resolve) => {
      // TODO: 实际停止服务的逻辑
      this.serviceRunning = false;
      console.log('Service stopped');
      resolve(true);
    });
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
  sendFile(file: File, devices: DeviceInfo[]): Promise<MessageData> {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }
      
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
      
      // TODO: 实际发送文件的逻辑
      console.log(`Sending file: ${file.name} (${this.formatFileSize(file.size)})`);
      console.log(`To devices: ${devices.map(d => d.name).join(', ')}`);
      
      // 模拟网络延迟和传输
      setTimeout(() => {
        msgData.status = 'success';
        resolve(msgData);
      }, 2000);
    });
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
  
  // 格式化文件大小
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  }
}

// 导出单例
export const lanShareApi = new LanShareApi(); 