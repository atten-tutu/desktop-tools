import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

// ✅ nodeIntegration 为 true 时可以用 require
const { ipcRenderer } = window.require('electron');

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const [image, setImage] = useState<string | null>(null);
  const [log, setLog] = useState('');

  const appendLog = (msg: string) => {
    console.log(msg);
    setLog((prev) => prev + msg + '\n');
  };

  async function captureScreen(): Promise<string | null> {
    try {
      appendLog('🟡 尝试调用 getDisplayMedia...');
      const stream = await navigator.mediaDevices.getDisplayMedia({
        audio: false,
      });

      appendLog('🟢 成功获取屏幕流，开始绘制视频帧');
      const video = document.createElement('video');
      video.srcObject = stream;

      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        appendLog('❌ 获取 canvas context 失败');
        return null;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64 = canvas.toDataURL('image/png');

      stream.getTracks().forEach((track) => track.stop());
      appendLog('✅ 成功生成截图 base64');

      return base64;
    } catch (err: any) {
      appendLog(`❌ 捕捉屏幕失败：${err.message}`);
      return null;
    }
  }

  const handleScreenshot = async () => {
    appendLog('📸 开始截图流程...');
    const base64 = await captureScreen();
    if (!base64) {
      appendLog('❌ 截图 base64 为空，截图中断');
      return;
    }

    appendLog('📤 正在发送 base64 给主进程打开编辑器...');
    const result = await ipcRenderer.invoke('open-screenshot-editor', base64);
    appendLog(result ? '✅ 编辑器窗口已打开' : '❌ 编辑器窗口未成功打开');

    setImage(base64);
  };

  return (
    <>
      <h1>{t('app_name')}</h1>
      <Space>
        <Link to="/theme">{t('theme')}</Link>
        <Link to="/timestamp">{t('timestamp_converter')}</Link>
        <Link to="/market">{t('app_market')}</Link>
        <Link to="/clipboard">{t('app_clipboard')}</Link>
        <Button type="outline" onClick={() => navigate({ to: '/settings' })}>
          {t('settings')}
        </Button>
      </Space>
      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: '#e6f4ff',
          borderRadius: 8,
          width: 320,
          textAlign: 'center',
        }}
      >
        <input
          type="text"
          placeholder="输入插件名，如 clipboard"
          value={pluginName}
          onChange={(e) => setPluginName(e.target.value)}
          style={{
            width: 180,
            marginRight: 8,
            padding: 4,
            borderRadius: 4,
            border: '1px solid #ccc',
          }}
        />
        <Button
          type="primary"
          onClick={() => {
            if (pluginName.trim()) {
              // 推荐用 window.ipcRenderer.openPlugin，如果你用的是 preload 暴露的API
              ipcRenderer.send('open-plugin', pluginName.trim());
              // 如果你用的是 import { ipcRenderer } from 'electron'，则用下面这行
              // ipcRenderer.send('open-plugin', pluginName.trim());
            }
          }}
        >
          打开插件
        </Button>
      </div>
    </>
  );
}
