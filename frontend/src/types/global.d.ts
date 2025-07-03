interface IpcRendererExposed {
  openPlugin?: (pluginName: string) => Promise<any>;
  downloadPlugin?: (plugin: { name: string; isDev?: boolean }) => Promise<any>; // ✅ 添加这个

  invoke?: (...args: any[]) => Promise<any>;
  on?: (...args: any[]) => void;
  off?: (...args: any[]) => void;
  send?: (...args: any[]) => void;
}

interface Window {
  ipcRenderer?: IpcRendererExposed;
  market: {
    getLocalPlugins: () => any;
    downloadPlugin: (plugin: any) => Promise<any>;
    // 你想暴露的函数都写上类型
  };
}
