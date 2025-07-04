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
      name: '神秘礼物1',
      description: '解压有神秘惊喜',
      version: '1.1.0',
      changelog: '测试用',
      installed: false,
    },
     {
      id: 3,
      name: '计算器Pro',
      description: '计算',
      version: '1.1.0',
      changelog: 'init',
      installed: false,
    },
  ]);

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

export { PluginProvider, usePluginContext };
