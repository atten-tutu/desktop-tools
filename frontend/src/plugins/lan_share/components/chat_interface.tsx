import React, { useState, useRef, useEffect } from 'react';
import { Message } from '@arco-design/web-react';
import { IconFile, IconCheck, IconClose, IconWifi } from '@arco-design/web-react/icon';
import { useTranslation } from '../../../i18n/i18n';
import { useLanShare } from '../context/LanShareContext';
import type { MessageData } from '../api';
import '../styles/chat_interface.css';

const ChatInterface: React.FC = () => {
  const { t } = useTranslation();
  const { messages, sendMessage, sendFile: apiSendFile, hostname, ip, port } = useLanShare();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  
  // 滚动到最新消息
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // 组件加载时自动聚焦
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);
  
  // 处理粘贴事件
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const clipboardData = e.clipboardData;
    
    // 处理文件粘贴
    if (clipboardData.files && clipboardData.files.length > 0) {
      const files = Array.from(clipboardData.files);
      files.forEach(file => {
        apiSendFile(file);
        Message.success(file.name);
      });
      return;
    }
    
    // 处理文本粘贴
    const text = clipboardData.getData('text');
    if (text) {
      sendMessage(text);
      return;
    }
    
    // 处理图片粘贴
    const items = clipboardData.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item && item.type && item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            apiSendFile(blob);
            Message.success(t('send'));
            return;
          }
        }
      }
    }
  };
  
  // 格式化时间
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // 消息气泡组件
  const MessageBubble: React.FC<{ message: MessageData }> = ({ message }) => {
    const statusIcon = () => {
      switch(message.status) {
        case 'success': return <IconCheck style={{ color: 'var(--color-success)' }} />;
        case 'failed': return <IconClose style={{ color: 'var(--color-danger)' }} />;
        case 'pending': return <span className="loading-dot"></span>;
      }
    };
    
    return (
      <div className={`message-bubble ${message.isOutgoing ? 'outgoing' : 'incoming'}`}>
        <div className="message-content">
          {!message.isOutgoing && message.deviceName && (
            <div className="device-name">{message.deviceName}</div>
          )}
          
          {message.type === 'image' ? (
            <div className="file-content">
              <img src={message.content} alt={message.fileName} className="image-preview" />
              <div className="file-info">
                <div className="file-name">{message.fileName}</div>
                <div className="file-size">{message.fileSize}</div>
              </div>
            </div>
          ) : message.type === 'file' ? (
            <div className="file-content">
              <IconFile className="file-icon" />
              <div className="file-info">
                <div className="file-name">{message.fileName}</div>
                <div className="file-size">{message.fileSize}</div>
              </div>
            </div>
          ) : (
            <div className="text-content">{message.content}</div>
          )}
          
          <div className="message-footer">
            {message.isOutgoing && (
              <span className="device-name-footer">{hostname}</span>
            )}
            <span className="timestamp">{formatTime(message.timestamp)}</span>
            {message.isOutgoing && (
              <span className="status-icon">{statusIcon()}</span>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div 
      ref={containerRef}
      className={`chat-container ${isFocused ? 'focused' : ''}`}
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onPaste={handlePaste}
    >
      <div className="messages-wrapper">
        {/* 固定的背景网络信息 */}
        <div className="network-info-background">
          <IconWifi className="network-icon-background" />
          <div className="network-text-background">
            {hostname} {ip}:{port}
          </div>
        </div>
        
        {/* 可滚动的消息区域 */}
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-messages-container">
              {/* 空白区域，不显示任何内容 */}
            </div>
          ) : (
            <>
              {messages.map(message => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 