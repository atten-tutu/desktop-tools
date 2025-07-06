import React, { createContext, useContext, useState, useEffect } from 'react';
import { lanShareApi } from '../api';
import type { DeviceInfo, MessageData } from '../api';

// 上下文类型定义
interface LanShareContextType {
  // 状态
  isServiceRunning: boolean;
  selectedDevices: DeviceInfo[];
  availableDevices: DeviceInfo[];
  messages: MessageData[];
  secretCode: string;
  
  // 操作方法
  toggleService: () => Promise<void>;
  setSecretCode: (code: string) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  sendFile: (file: File) => Promise<void>;
  scanDevices: () => Promise<void>;
  selectDevice: (deviceId: string, selected: boolean) => void;
  selectAllDevices: (selected: boolean) => void;
}

// 创建上下文
const LanShareContext = createContext<LanShareContextType | undefined>(undefined);

// 上下文提供者
export const LanShareProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isServiceRunning, setIsServiceRunning] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<DeviceInfo[]>([]);
  const [availableDevices, setAvailableDevices] = useState<DeviceInfo[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [secretCode, setSecretCodeState] = useState('');
  
  // 初始化
  useEffect(() => {
    // 获取服务状态
    const serviceStatus = lanShareApi.getServiceStatus();
    setIsServiceRunning(serviceStatus);
    
    // 如果服务已启动，扫描设备
    if (serviceStatus) {
      scanDevices();
    }
  }, []);
  
  // 切换服务状态
  const toggleService = async () => {
    try {
      if (isServiceRunning) {
        await lanShareApi.stopService();
        setIsServiceRunning(false);
      } else {
        await lanShareApi.startService();
        setIsServiceRunning(true);
        // 启动服务后扫描设备
        await scanDevices();
      }
    } catch (error) {
      console.error('Failed to toggle service:', error);
    }
  };
  
  // 设置暗号
  const setSecretCode = async (code: string) => {
    try {
      await lanShareApi.setSecretCode(code);
      setSecretCodeState(code);
    } catch (error) {
      console.error('Failed to set secret code:', error);
    }
  };
  
  // 扫描设备
  const scanDevices = async () => {
    try {
      const devices = await lanShareApi.scanDevices();
      setAvailableDevices(devices);
    } catch (error) {
      console.error('Failed to scan devices:', error);
    }
  };
  
  // 选择设备
  const selectDevice = (deviceId: string, selected: boolean) => {
    if (selected) {
      const device = availableDevices.find(d => d.id === deviceId);
      if (device) {
        setSelectedDevices(prev => [...prev, device]);
      }
    } else {
      setSelectedDevices(prev => prev.filter(d => d.id !== deviceId));
    }
  };
  
  // 选择所有设备
  const selectAllDevices = (selected: boolean) => {
    if (selected) {
      setSelectedDevices([...availableDevices]);
    } else {
      setSelectedDevices([]);
    }
  };
  
  // 发送消息
  const sendMessage = async (message: string) => {
    if (!isServiceRunning) {
      console.error('Service is not running');
      return;
    }
    
    try {
      const msgData = await lanShareApi.sendMessage(message, selectedDevices);
      setMessages(prev => [...prev, msgData]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  // 发送文件
  const sendFile = async (file: File) => {
    if (!isServiceRunning) {
      console.error('Service is not running');
      return;
    }
    
    try {
      const msgData = await lanShareApi.sendFile(file, selectedDevices);
      setMessages(prev => [...prev, msgData]);
    } catch (error) {
      console.error('Failed to send file:', error);
    }
  };
  
  // 上下文值
  const contextValue: LanShareContextType = {
    isServiceRunning,
    selectedDevices,
    availableDevices,
    messages,
    secretCode,
    toggleService,
    setSecretCode,
    sendMessage,
    sendFile,
    scanDevices,
    selectDevice,
    selectAllDevices,
  };
  
  return (
    <LanShareContext.Provider value={contextValue}>
      {children}
    </LanShareContext.Provider>
  );
};

// 使用上下文的钩子
export const useLanShare = () => {
  const context = useContext(LanShareContext);
  if (context === undefined) {
    throw new Error('useLanShare must be used within a LanShareProvider');
  }
  return context;
};

export default LanShareContext; 