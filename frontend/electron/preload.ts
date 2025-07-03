import { ipcRenderer, contextBridge } from 'electron';
import remote from '@electron/remote';

console.log('✅ preload.js 注入成功');

contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },
  openPlugin: (pluginName: string) =>
    ipcRenderer.invoke('open-plugin', pluginName),
});

// ✅ 正确暴露 market 到渲染进程
contextBridge.exposeInMainWorld('market', {
  getLocalPlugins() {
    return remote.getGlobal('LOCAL_PLUGINS').getLocalPlugins();
  },
  downloadPlugin(plugin) {
    return remote.getGlobal('LOCAL_PLUGINS').downloadPlugin(plugin);
  },
});
