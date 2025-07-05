import React, { createContext, useContext, useState, useEffect } from 'react';
import { lanShareApi } from '../api';
import type { DeviceInfo, MessageData } from '../api';

// 本地存储键名
const STORAGE_KEYS = {
  PORT: 'lanSharePort',
  CUSTOM_HOSTNAME: 'lanShareCustomHostname',
  SAVE_PATH: 'lanShareSavePath',
  SECRET_CODE: 'lanShareSecretCode',
  SERVICE_RUNNING: 'lanShareServiceRunning'
};

// 默认值
const DEFAULT_VALUES = {
  PORT: 3000,
  SAVE_PATH: '',
  SECRET_CODE: ''
};

// 从 localStorage 读取值，如果不存在则返回默认值
const getStoredValue = <T,>(key: string, defaultValue: T): T => {
  try {
    const value = localStorage.getItem(key);
    if (value === null) {
      return defaultValue;
    }
    try {
      return JSON.parse(value) as T;
    } catch (jsonError) {
      console.warn(`Error parsing JSON for ${key}, using raw value:`, jsonError);
      // 对于字符串类型的默认值，可以直接返回原始字符串
      if (typeof defaultValue === 'string') {
        return value as unknown as T;
      }
      // 其他类型则返回默认值
      return defaultValue;
    }
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// 上下文类型定义
interface LanShareContextType {
  // 状态
  isServiceRunning: boolean;
  selectedDevices: DeviceInfo[];
  availableDevices: DeviceInfo[];
  messages: MessageData[];
  secretCode: string;
  hostname: string;
  ip: string;
  port: number;
  savePath: string;
  
  // 操作方法
  toggleService: () => Promise<void>;
  setSecretCode: (code: string) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  sendFile: (file: File) => Promise<void>;
  scanDevices: () => Promise<void>;
  selectDevice: (deviceId: string, selected: boolean) => void;
  selectAllDevices: (selected: boolean) => void;
  setPort: (port: number) => void;
  setSavePath: (path: string) => void;
  setHostname: (hostname: string) => void;
}

// 创建上下文
const LanShareContext = createContext<LanShareContextType | undefined>(undefined);

// 上下文提供者
export const LanShareProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // 初始状态设置为 false，稍后从服务器获取真实状态
  const [isServiceRunning, setIsServiceRunning] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState<DeviceInfo[]>([]);
  const [availableDevices, setAvailableDevices] = useState<DeviceInfo[]>([]);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [secretCode, setSecretCodeState] = useState(
    getStoredValue(STORAGE_KEYS.SECRET_CODE, DEFAULT_VALUES.SECRET_CODE)
  );
  const [hostname, setHostnameState] = useState('');
  const [ip, setIp] = useState('');
  const [port, setPortState] = useState(
    getStoredValue(STORAGE_KEYS.PORT, DEFAULT_VALUES.PORT)
  );
  const [savePath, setSavePathState] = useState(
    getStoredValue(STORAGE_KEYS.SAVE_PATH, DEFAULT_VALUES.SAVE_PATH)
  );
  
  // 数据迁移 - 确保所有存储的值都是有效的 JSON 格式
  const migrateLocalStorageData = () => {
    // 迁移所有可能存在的非 JSON 格式数据
    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value !== null) {
          try {
            // 尝试解析 JSON，如果成功则不需要迁移
            JSON.parse(value);
          } catch (e) {
            // 如果解析失败，说明不是有效的 JSON，需要转换
            console.log(`Migrating non-JSON value for ${key}`);
            localStorage.setItem(key, JSON.stringify(value));
          }
        }
      } catch (error) {
        console.error(`Error migrating ${key}:`, error);
      }
    });
  };
  
  // 初始化
  useEffect(() => {
    // 数据迁移 - 确保所有存储的值都是有效的 JSON 格式
    migrateLocalStorageData();
    
    // 获取服务状态 - 修复异步调用
    const checkServiceStatus = async () => {
      try {
        console.log('Checking actual service status from server...');
        const serviceStatus = await lanShareApi.getServiceStatus();
        console.log(`Actual service status from server: ${serviceStatus}`);
        
        // 更新状态和 localStorage
        setIsServiceRunning(serviceStatus);
        localStorage.setItem(STORAGE_KEYS.SERVICE_RUNNING, JSON.stringify(serviceStatus));
        
        // 如果服务已启动，扫描设备
        if (serviceStatus) {
          scanDevices();
        }
      } catch (error) {
        console.error('Failed to check service status:', error);
        // 出错时设置为 false
        setIsServiceRunning(false);
        localStorage.setItem(STORAGE_KEYS.SERVICE_RUNNING, JSON.stringify(false));
      }
    };
    
    checkServiceStatus();

    const fetchHostname = async () => {
      try {
        // 先尝试获取自定义主机名
        const customHostname = localStorage.getItem(STORAGE_KEYS.CUSTOM_HOSTNAME);
        if (customHostname) {
          try {
            // 尝试解析 JSON
            const parsedHostname = JSON.parse(customHostname);
            setHostnameState(parsedHostname);
          } catch (e) {
            // 如果解析失败，直接使用字符串值
            console.log('Using raw hostname string from localStorage');
            setHostnameState(customHostname);
            // 重新以正确的格式保存
            localStorage.setItem(STORAGE_KEYS.CUSTOM_HOSTNAME, JSON.stringify(customHostname));
          }
        } else {
          // 如果没有自定义主机名，获取系统主机名
          const response = await lanShareApi.getHostname();
          setHostnameState(response);
        }
      } catch (error) {
        console.error('Failed to fetch hostname:', error);
      }
    };

    const fetchIp = async () => {
      try {
        const response = await lanShareApi.getIp();
        setIp(response);
      } catch (error) {
        console.error('Failed to fetch IP:', error);
      }
    };

    fetchHostname();
    fetchIp();
  }, []);
  
  // 当服务运行状态变化时，保存到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICE_RUNNING, JSON.stringify(isServiceRunning));
  }, [isServiceRunning]);
  
  // 切换服务状态
  const toggleService = async () => {
    try {
      if (isServiceRunning) {
        await lanShareApi.stopService();
        setIsServiceRunning(false);
      } else {
        // 在启动服务前设置必要的参数
        console.log(`Setting port to ${port} and save path to ${savePath}`);
        lanShareApi.setPort(port);
        lanShareApi.setSavePath(savePath);
        
        // 启动服务
        const startResult = await lanShareApi.startService();
        console.log(`Service start result: ${startResult}`);
        
        // 明确转换为布尔值并更新状态
        const success = Boolean(startResult);
        setIsServiceRunning(success);
        
        // 测试服务器连接
        if (success) {
          setTimeout(async () => {
            const testResult = await lanShareApi.testServerConnection();
            console.log('Server connection test result:', testResult);
          }, 1000);
          
          // 启动服务后扫描设备
          await scanDevices();
        }
      }
    } catch (error) {
      console.error('Failed to toggle service:', error);
    }
  };
  
  // 设置暗号并持久化
  const setSecretCode = async (code: string) => {
    try {
      await lanShareApi.setSecretCode(code);
      setSecretCodeState(code);
      localStorage.setItem(STORAGE_KEYS.SECRET_CODE, JSON.stringify(code));
    } catch (error) {
      console.error('Failed to set secret code:', error);
    }
  };
  
  // 设置端口并持久化
  const setPort = (newPort: number) => {
    setPortState(newPort);
    localStorage.setItem(STORAGE_KEYS.PORT, JSON.stringify(newPort));
  };
  
  // 设置保存路径并持久化
  const setSavePath = (path: string) => {
    setSavePathState(path);
    localStorage.setItem(STORAGE_KEYS.SAVE_PATH, JSON.stringify(path));
  };

  // 设置主机名并持久化
  const setHostname = (newHostname: string) => {
    setHostnameState(newHostname);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_HOSTNAME, JSON.stringify(newHostname));
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
    hostname,
    ip,
    port,
    savePath,
    toggleService,
    setSecretCode,
    sendMessage,
    sendFile,
    scanDevices,
    selectDevice,
    selectAllDevices,
    setPort,
    setSavePath,
    setHostname,
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