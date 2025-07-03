import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { useTranslation } from '../i18n/i18n';
import {
  Space,
  Button,
  Input,
  Message,
  Typography,
  Spin,
} from '@arco-design/web-react';
import { ipcRenderer } from 'electron';
import React, { useState } from 'react';

const { Text } = Typography;
const { market } = window.require('electron');
export const Route = createFileRoute('/')({
  component: App,
});

export default function App() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [pluginName, setPluginName] = useState('');
  const [devPluginName, setDevPluginName] = useState('');
  const [loading, setLoading] = useState(false);
  const [installResult, setInstallResult] = useState<null | {
    status: 'success' | 'error';
    message: string;
  }>(null);

  const [logList, setLogList] = useState<string[]>([]);

  const log = (msg: string) => {
    setLogList((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] ${msg}`,
    ]);
  };

  React.useEffect(() => {
    if (!window.market) {
      log(window.market);
    } else {
      log('✅ window.market 存在');
      log(
        typeof window.market.downloadPlugin === 'function'
          ? '✅ downloadPlugin 是函数'
          : '❌ downloadPlugin 不是函数'
      );
    }
  }, []);

  const installDevPlugin = () => {
    if (!devPluginName.trim()) {
      setInstallResult({ status: 'error', message: '请输入插件名' });
      return;
    }

    setLoading(true);
    setInstallResult(null);
    log(`🚀 开始安装插件: ${devPluginName}`);

    window.market
      ?.downloadPlugin({ name: devPluginName.trim(), isDev: true })
      .then(() => {
        log(`✅ 插件 ${devPluginName} 安装成功`);
        setInstallResult({
          status: 'success',
          message: `插件 ${devPluginName} 安装成功 ✅`,
        });
      })
      .catch((err) => {
        log(`❌ 插件安装失败: ${err?.message || '未知错误'}`);
        setInstallResult({
          status: 'error',
          message: `插件安装失败 ❌：${err?.message || '未知错误'}`,
        });
      })
      .finally(() => {
        log('🔚 安装流程完成（finally）');
        setLoading(false);
      });

    // 10 秒后超时警告
    setTimeout(() => {
      if (loading) {
        log('⏰ 插件安装超时（可能 preload 没注入，或 Promise 没返回）');
      }
    }, 10000);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>{t('app_name')}</h1>

      {/* 插件安装区 */}
      <div
        style={{
          marginTop: 24,
          padding: 16,
          background: '#fffbe6',
          borderRadius: 8,
          width: 420,
          textAlign: 'center',
        }}
      >
        <h3>开发者插件安装</h3>
        <Input
          placeholder="如 hello-plugin"
          style={{ width: 240, marginRight: 8 }}
          value={devPluginName}
          onChange={setDevPluginName}
          disabled={loading}
        />
        <Button type="primary" loading={loading} onClick={installDevPlugin}>
          安装
        </Button>

        {installResult && (
          <div style={{ marginTop: 12 }}>
            <Text
              type={installResult.status === 'success' ? 'success' : 'danger'}
            >
              {installResult.message}
            </Text>
          </div>
        )}
        {loading && (
          <div style={{ marginTop: 12 }}>
            <Spin dot />
          </div>
        )}
      </div>

      {/* 调试输出区 */}
      <div
        style={{
          marginTop: 32,
          background: '#f6f6f6',
          padding: 16,
          borderRadius: 8,
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          maxHeight: 300,
          overflowY: 'auto',
        }}
      >
        <strong>🪵 调试日志：</strong>
        {logList.length === 0 ? (
          <div style={{ marginTop: 8, color: '#999' }}>暂无日志</div>
        ) : (
          logList.map((line, i) => (
            <div key={i} style={{ marginTop: 4 }}>
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
