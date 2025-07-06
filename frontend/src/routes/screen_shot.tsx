// src/screen-shot.tsx
import { useEffect, useRef, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { saveCanvasToBase64 } from '../utils/saveCanvastoBase64';

export const Route = createFileRoute('/screen_shot')({
  component: ScreenShot,
});

const { ipcRenderer } = window.require('electron');

// 工具栏按钮配置
const TOOLBAR_ITEMS = [
  { id: 'snipaste', label: '贴图' },
  { id: 'xd', label: '线段' },
  { id: 'msk', label: '马赛克' },
  { id: 'confirm', label: '确认' },
  { id: 'close', label: '关闭' },
];

export default function ScreenShot() {
  // —— 1. 所有 useState 定义都写在这里 ——
  type Tool = 'snip' | 'line' | 'msk';
  const [currentTool, setCurrentTool] = useState<Tool>('snip');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<string | null>(null);

  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(
    null
  );

  // 工具栏控制
  const [toolVisible, setToolVisible] = useState(false);
  const [toolPos, setToolPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const getSelectedAreaBase64 = () => {
    if (!canvasRef.current || !startPos || !currentPos) return null;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const w = Math.abs(startPos.x - currentPos.x);
    const h = Math.abs(startPos.y - currentPos.y);

    // ✅ 不合法尺寸：不截图
    if (w === 0 || h === 0) return null;

    try {
      return saveCanvasToBase64(ctx, x, y, w, h, 0.8, false);
    } catch (err) {
      console.error('⚠️ getImageData 出错:', err);
      return null;
    }
  };

  // 禁用滚动条 & 去除默认 margin/padding
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // 接收主进程发来的截图
  useEffect(() => {
    ipcRenderer.once('load-image', (_e, base64: string) => {
      setImage(base64);
    });
  }, []);

  // 处理拖拽 & 工具栏显示
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      setStartPos({ x: e.clientX, y: e.clientY });
      setCurrentPos({ x: e.clientX, y: e.clientY });
      setIsDragging(true);
      setToolVisible(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !startPos) return;
      setCurrentPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      setIsDragging(false);
      if (!startPos) return;

      // 拖拽终点
      const endX = e.clientX;
      const endY = e.clientY;

      // 计算选区
      const left = Math.min(startPos.x, endX);
      const top = Math.min(startPos.y, endY);
      const width = Math.abs(startPos.x - endX);
      const height = Math.abs(startPos.y - endY);

      // 工具栏放在选区正下方 8px
      setToolPos({ x: left, y: top + height + 8 });
      setToolVisible(true);
    };

    // 绑定事件
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startPos]);

  // 重绘画布：底图 + 蒙层 + 选区洞 + 描边
  useEffect(() => {
    if (!canvasRef.current || !image) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const cw = canvas.width;
      const ch = canvas.height;

      // 原图
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, 0, 0, cw, ch);

      // 蒙层
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, cw, ch);

      // 挖洞 + 描边
      if (startPos && currentPos) {
        const x = Math.min(startPos.x, currentPos.x);
        const y = Math.min(startPos.y, currentPos.y);
        const w = Math.abs(startPos.x - currentPos.x);
        const h = Math.abs(startPos.y - currentPos.y);

        // 挖洞
        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
        ctx.clearRect(x, y, w, h);
        ctx.restore();

        // 描边
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.drawImage(img, 0, 0, cw, ch);
        ctx.restore();

        // 4. 可选：给选区描边
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
      }
    };
    img.src = image;
  }, [image, startPos, currentPos]);

  // 确认：发送最终截图
  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const finalBase64 = canvas.toDataURL();
      ipcRenderer.send('screenshot-confirm', finalBase64);
    }
  };

  // 工具栏按钮逻辑
  const handleToolbarClick = (id: string) => {
    switch (id) {
      case 'undo':
        setStartPos(null);
        setCurrentPos(null);
        setToolVisible(false);
        break;
      case 'confirm':
        handleConfirm();
        break;
      case 'close':
        ipcRenderer.send('screenshot-cancel');
        break;
      case 'snipaste':
        const selectedBase64 = getSelectedAreaBase64();
        if (selectedBase64) {
          ipcRenderer.send('screenshot-cancel');
          ipcRenderer.invoke('minimize-main-window');
          ipcRenderer.invoke('create-floating-image-window', selectedBase64);
        } else {
          alert('未选中区域！');
        }
        break;

      // case 'snipaste':
      //   if (canvasRef.current) {
      //     const base64 = canvasRef.current.toDataURL()
      //     // ipcRenderer.send('screenshot-cancel')
      //     ipcRenderer.invoke('create-floating-image-window', base64)

      //   }
      //   break
    }
  };

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        width: '100vw',
        height: '100vh',
        position: 'relative',
        cursor: 'crosshair',
      }}
    >
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
      {image && startPos && currentPos && (
        <div
          style={{
            position: 'fixed',
            bottom: 10,
            left: 10,
            background: 'white',
            border: '1px solid #ccc',
            padding: '4px',
            zIndex: 9999,
          }}
        >
          <div style={{ fontSize: 12, marginBottom: 4 }}>框选区域预览：</div>
          <img
            src={getSelectedAreaBase64() ?? ''}
            alt="选区预览"
            style={{
              maxWidth: '200px',
              maxHeight: '150px',
              border: '1px solid gray',
            }}
          />
        </div>
      )}

      {toolVisible && (
        <div
          style={{
            position: 'fixed',
            top: toolPos.y,
            left: toolPos.x,
            display: 'flex',
            gap: '8px',
            background: 'rgba(255,255,255,0.9)',
            padding: '4px',
            borderRadius: 4,
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            zIndex: 9999,
          }}
        >
          {TOOLBAR_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleToolbarClick(item.id)}
              style={{
                padding: '4px 8px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
