import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Upload, Empty, Message } from '@arco-design/web-react';
import { IconSend, IconFile, IconCheck, IconClose, IconDelete } from '@arco-design/web-react/icon';
import { useTranslation } from '../../../i18n/i18n';
import { useLanShare } from '../context/LanShareContext';
import type { MessageData, MessageType, MessageStatus } from '../api';
import type { UploadItem } from '@arco-design/web-react/es/Upload';
import '../styles/chat_interface.css';

const ChatInterface: React.FC = () => {
  const { t } = useTranslation();
  const { messages, sendMessage, sendFile: apiSendFile } = useLanShare();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // 设置全局拖拽事件监听器
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };
    
    const handleGlobalDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // 检查是否离开了视口区域
      const { clientX, clientY } = e;
      const { left, top, right, bottom } = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0, right: 0, bottom: 0 };
      if (
        clientX <= left ||
        clientX >= right ||
        clientY <= top ||
        clientY >= bottom
      ) {
        setIsDragging(false);
      }
    };
    
    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        setSelectedFiles(prev => [...prev, ...files]);
      }
    };
    
    // 添加全局事件监听
    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('dragleave', handleGlobalDragLeave);
    document.addEventListener('drop', handleGlobalDrop);
    
    return () => {
      // 清理事件监听
      document.removeEventListener('dragover', handleGlobalDragOver);
      document.removeEventListener('dragleave', handleGlobalDragLeave);
      document.removeEventListener('drop', handleGlobalDrop);
    };
  }, []);
  
  // 处理文件选择
  const handleFileSelect = (fileList: UploadItem[], file: UploadItem) => {
    if (file && file.originFile) {
      const newFile = file.originFile;
      setSelectedFiles(prev => [...prev, newFile]);
    }
  };
  
  // 发送所有选择的文件
  const handleSendAllFiles = () => {
    if (selectedFiles.length === 0) {
      Message.info(t('no_files_selected'));
      return;
    }
    
    // 发送所有文件
    selectedFiles.forEach(file => {
      apiSendFile(file);
    });
    
    // 清空选择的文件列表
    setSelectedFiles([]);
  };
  
  // 移除选择的文件
  const handleRemoveFile = (file: File) => {
    setSelectedFiles(prev => prev.filter(f => f !== file));
  };
  
  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
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
          
          {message.type === 'text' ? (
            <div className="text-content">{message.content}</div>
          ) : (
            <div className="file-content">
              <IconFile className="file-icon" />
              <div className="file-info">
                <div className="file-name">{message.fileName}</div>
                <div className="file-size">{message.fileSize}</div>
              </div>
            </div>
          )}
          
          <div className="message-footer">
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
      className={`chat-container ${isDragging ? 'dragging' : ''}`}
    >
      <div className="messages-container">
        {messages.length === 0 ? (
          <Empty
            className="empty-message"
            description={t('no_messages')}
          />
        ) : (
          <>
            {messages.map(message => (
              <MessageBubble key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      <div className="input-container">
        <div className="upload-area">
          {/* 文件预览区域 */}
          {selectedFiles.length > 0 && (
            <div className="file-preview-area">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-preview-item">
                  <span className="file-preview-name">{file.name}</span>
                  <span 
                    className="file-preview-remove" 
                    onClick={() => handleRemoveFile(file)}
                    title="移除"
                  >
                    <IconDelete />
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {/* 上传区域和发送按钮 */}
          <div className="upload-send-container">
            <Upload
              className="custom-upload"
              drag
              multiple
              autoUpload={false}
              showUploadList={false}
              onChange={handleFileSelect}
              action="/"
            >
              <div className="upload-drag-content">
                {t('drag_files_here')}
              </div>
            </Upload>
            <Button
              className="send-button"
              type="primary"
              icon={<IconSend />}
              onClick={handleSendAllFiles}
              disabled={selectedFiles.length === 0}
            >
              {t('send')}
            </Button>
          </div>
        </div>
      </div>
      
      {isDragging && (
        <div className="drag-hint">
          {t('drag_files_here')}
        </div>
      )}
    </div>
  );
};

export default ChatInterface; 