// src/plugins/market/electron-main.ts
import { Message } from '@arco-design/web-react';
import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';

// 处理卸载插件请求
ipcMain.handle('uninstall-plugin', async (event, pluginName) => {
    const uploadDir = path.join(__dirname, 'uploads');
    const zipFilePath = path.join(uploadDir, `${pluginName}.zip`);
    const pluginDir = path.join(uploadDir, pluginName);

    try {
        // 删除zip文件
        if (fs.existsSync(zipFilePath)) {
            fs.unlinkSync(zipFilePath);
        }

        // 删除文件夹及其内容
        if (fs.existsSync(pluginDir)) {
            fs.rmSync(pluginDir, { recursive: true, force: true });
        }

        return { success: true, message: '插件卸载成功' };
    } catch (error) {
    if (error instanceof Error) {
        console.error('卸载插件失败:', error.message);
    } else {
        console.error('卸载插件失败:', error);
    }
    Message.error('插件卸载失败，请稍后重试');
}
});
