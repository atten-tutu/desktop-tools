// src/plugins/market/index.tsx
import React, { useEffect, useState } from 'react';
import { clipboard } from 'electron';
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
      const newDataUrl = newImg.toDataURL();
      if (newDataUrl && newDataUrl !== lastImage) {
        setImages(prev => {
          const next = [newDataUrl, ...prev].slice(0, 10); // 只保留10条
          localStorage.setItem(IMG_KEY, JSON.stringify(next));
          return next;
        });
        lastImage = newDataUrl;
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
            <p key={index}>{msg}</p>
          ))}
        </div>
      )}
      {tab === 'image' && (
        <div>
          {images.map((imgSrc, index) => (
            <img key={index} src={imgSrc} alt={`Clipboard Image ${index}`} style={{ maxWidth: '100px', height: 'auto' }} />
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
