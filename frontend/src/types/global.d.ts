interface IpcRendererExposed {
  openPlugin?: (pluginName: string) => Promise<any>;
  invoke?: (...args: any[]) => Promise<any>;
  on?: (...args: any[]) => void;
  off?: (...args: any[]) => void;
  send?: (...args: any[]) => void;
}

interface Window {
  ipcRenderer?: IpcRendererExposed;
}