// src/plugins/market/index.tsx
import React, { useEffect, useState } from 'react';
import { clipboard, nativeImage } from 'electron';
import { Link } from '@tanstack/react-router';

const MSG_KEY = 'clipboard_text_history';
const IMG_KEY = 'clipboard_image_history';

const ClipBoardPlugin: React.FC = () => {
  const [messages, setMessages] = useState<string[]>(() => {
    const saved = localStorage.getItem(MSG_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [images, setImages] = useState<string[]>(() => {
    const saved = localStorage.getItem(IMG_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [tab, setTab] = useState<'text' | 'image'>('text');

  useEffect(() => {
    let lastText = messages[0] || '';
    let lastImage = images[0] || '';
    const timer = setInterval(() => {
      const newText = clipboard.readText();
      if (newText && newText !== lastText) {
        setMessages(prev => {
          const next = [newText, ...prev].slice(0, 10); // 只保留10条
          localStorage.setItem(MSG_KEY, JSON.stringify(next));
          return next;
        });
        lastText = newText;
      }
      const newImg = clipboard.readImage();
      if(!newImg.isEmpty()){
        const newDataUrl = newImg.toDataURL();
        if (newDataUrl && newDataUrl !== lastImage) {
          setImages(prev => {
            const next = [newDataUrl, ...prev].slice(0, 10); // 只保留10条
            localStorage.setItem(IMG_KEY, JSON.stringify(next));
            return next;
          });
          lastImage = newDataUrl;
        }
      }
    }, 300);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <h2>剪贴板</h2>
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setTab('text')}
          style={{
            marginRight: 8,
            fontWeight: tab === 'text' ? 'bold' : 'normal',
            background: tab === 'text' ? '#e6f4ff' : undefined,
          }}
        >
          文本剪贴板
        </button>
        <button
          onClick={() => setTab('image')}
          style={{
            fontWeight: tab === 'image' ? 'bold' : 'normal',
            background: tab === 'image' ? '#e6f4ff' : undefined,
          }}
        >
          图片剪贴板
        </button>
      </div>
      {tab === 'text' && (
        <div>
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                padding: '8px',
                margin: '8px 0',
                background: '#f5f5f5',
                borderRadius: '4px',
                cursor: 'pointer',
                userSelect: 'text',
              }}
              onContextMenu={e => {
                e.preventDefault();
                clipboard.writeText(msg);
              }}
              title="右键复制"
            >
              {msg}
            </div>
          ))}
        </div>
      )}
      {tab === 'image' && (
        <div>
          {images.map((imgSrc, index) => (
            <div
              key={index}
              style={{
                display: 'inline-block',
                margin: '8px',
                background: '#f5f5f5',
                borderRadius: '4px',
                padding: '4px',
              }}
              onContextMenu={e => {
                e.preventDefault();
                // 直接用 nativeImage.createFromDataURL
                const img = nativeImage.createFromDataURL(imgSrc);
                clipboard.writeImage(img);
              }}
              title="右键复制图片"
            >
              <img src={imgSrc} alt={`Clipboard Image ${index}`} style={{ maxWidth: '128px', height: '144px' }} />
            </div>
          ))}
        </div>
      )}
      <div>
        <Link to="/">返回首页</Link>
      </div>
    </>
  );
};

export default ClipBoardPlugin;
