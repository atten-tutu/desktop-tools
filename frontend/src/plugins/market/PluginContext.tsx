// src/plugins/market/PluginContext.tsx
import { myFetch } from '../../utils/api-client';
import React, { createContext, useContext, useEffect, useState } from 'react';

const API_URL_Plugins = 'http://47.110.158.139:3771/api/plugins';

// 定义插件类型
type Plugin = {
  id: number;
  name: string;
  description: string;
  version: string;
  changelog: string;
  installed: boolean;
};

// 后端返回的数据结构
type ApiPlugin = {
  id: number;
  name: string;
  jsonData: string;
};

// 解析不规范的 jsonData 字符串
function parsePluginData(jsonData: string): Plugin {
  try {
    // 提取 key=value 对
    const regex = /(\w+)=([^,}]*)/g;
    const pairs: Record<string, string> = {}; // 明确类型定义
    
    let match;
    while ((match = regex.exec(jsonData))) {
      const [, key, value] = match;
      if (key && value) { // 增加空值检查
        pairs[key.trim()] = value.trim();
      }
    }
    
    // 转换为正确类型
    return {
      id: Number(pairs.id) || 0,
      name: pairs.name || '',
      description: pairs.description || '',
      version: pairs.version || '',
      changelog: pairs.changelog || '',
      installed: pairs.installed === 'true'
    };
  } catch (error) {
    console.error('Failed to parse plugin data:', error, jsonData);
    return {
      id: 0,
      name: '解析失败',
      description: '',
      version: '',
      changelog: '',
      installed: false
    };
  }
}

// 创建上下文
const PluginContext = createContext<{
  plugins: Plugin[];
  addPlugin: (plugin: Plugin) => void;
}>({
  plugins: [],
  addPlugin: () => {},
});

// 上下文提供者组件
const PluginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);

  useEffect(() => {
    const fetchPlugins = async () => {
      try {
        const response = await myFetch(API_URL_Plugins, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch plugins');
        }
        
        const apiPlugins = await response.json() as ApiPlugin[];
        
        // 转换 API 数据为前端需要的格式
        const convertedPlugins = apiPlugins.map(apiPlugin => {
          const pluginData = parsePluginData(apiPlugin.jsonData);
          return {
            ...pluginData,
            // 使用外层 ID 覆盖内层 ID（如果需要）
            id: apiPlugin.id 
          };
        });
        
        setPlugins(convertedPlugins);
      } catch (error) {
        console.error('Error fetching plugins:', error);
        // 可以添加错误处理逻辑，如设置错误状态
      }
    };

    fetchPlugins();
  }, []);

  const addPlugin = (plugin: Plugin) => {
    console.log('Received plugin:', plugin);
    setPlugins([...plugins, plugin]);
  };

  return (
    <PluginContext.Provider value={{ plugins, addPlugin }}>
      {children}
    </PluginContext.Provider>
  );
};

const usePluginContext = () => {
  return useContext(PluginContext);
};

export { PluginContext,PluginProvider, usePluginContext };
