import { ipcMain } from 'electron';
import { DateTime } from 'luxon';

class TimestampPlugin {
  constructor() {
    this.initialize();
  }

  initialize() {
    // 注册IPC监听器
    this.registerIPCHandlers();
  }

  registerIPCHandlers() {
    // 获取系统时区
    ipcMain.handle('timestamp:getSystemTimezone', () => {
      return DateTime.local().zoneName;
    });

    // 获取系统时间
    ipcMain.handle('timestamp:getSystemTime', () => {
      return DateTime.now().toISO();
    });
  }

  // 插件卸载时清理
  destroy() {
    ipcMain.removeHandler('timestamp:getSystemTimezone');
    ipcMain.removeHandler('timestamp:getSystemTime');
  }
}

export default TimestampPlugin; 