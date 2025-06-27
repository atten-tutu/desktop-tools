import { useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/snipaste')({
  component: Snipaste,
});

export default function Snipaste() {
  const [base64, setBase64] = useState<string | null>(null);

  useEffect(() => {
    const { ipcRenderer } = window.require('electron');
    ipcRenderer.once('load-image', (_event, dataUrl) => {
      setBase64(dataUrl);
    });

    // Remove default margins and background for transparent overlay
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.background = 'transparent';
  }, []);

  if (!base64) {
    return null;
  }

  return (
    <img
      src={base64}
      alt="screenshot"
      style={{
        position: 'fixed', // 固定定位，覆盖整个窗口
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        objectFit: 'contain',
        zIndex: 9999, // 最大层级
        WebkitAppRegion: 'drag', // 可拖拽区域
        userSelect: 'none', // 禁止选中
      }}
    />
  );
}
