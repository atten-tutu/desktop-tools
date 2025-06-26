import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router'; // 引入 Link 组件
import { useTranslation } from '../i18n/i18n';
import { Space, Button } from '@arco-design/web-react';
import { ipcRenderer } from 'electron';
import React, { useState } from 'react';

export const Route = createFileRoute('/')({
  component: App,
});

export default function App() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pluginName, setPluginName] = useState('');

  return (
    <>
      <h1>{t('app_name')}</h1>
      <Space>
        <Link to="/theme">{t('theme')}</Link>
        <Link to="/timestamp">{t('timestamp_converter')}</Link>
        <Link to="/market">{t('app_market')}</Link>
        <Link to="/clipboard">{t('app_clipboard')}</Link>
        <Button type='outline' onClick={() => navigate({ to: '/settings' })}>{t('settings')}</Button>
      </Space>
      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: '#e6f4ff',
          borderRadius: 8,
          width: 320,
          textAlign: 'center'
        }}
      >
        <input
          type="text"
          placeholder="输入插件名，如 clipboard"
          value={pluginName}
          onChange={e => setPluginName(e.target.value)}
          style={{
            width: 180,
            marginRight: 8,
            padding: 4,
            borderRadius: 4,
            border: '1px solid #ccc'
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