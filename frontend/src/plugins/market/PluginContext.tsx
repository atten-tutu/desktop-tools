// src/plugins/market/PluginContext.tsx
import React, { createContext, useContext, useState } from 'react';

// 定义插件类型
type Plugin = {
  id: number;
  name: string;
  description: string;
  version: string;
  changelog: string;
  installed: boolean;
};

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
  const [plugins, setPlugins] = useState<Plugin[]>([
    {
      id: 1,
      name: '主题插件',
      description: '用于切换应用的主题',
      version: '1.0.0',
      changelog: '初始版本发布',
      installed: false,
    },
    {
      id: 2,
      name: '时间戳转换插件',
      description: '方便进行时间戳和日期的相互转换',
      version: '1.1.0',
      changelog: '优化转换算法，增加更多时区支持',
      installed: false,
    },
  ]);

  const addPlugin = (plugin: Plugin) => {
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

export { PluginProvider, usePluginContext };
