// src/pages/dev.tsx
import { createFileRoute } from '@tanstack/react-router';
import {
  Button,
  Input,
  Message,
  Typography,
  Spin,
} from '@arco-design/web-react';
import React, { useState } from 'react';

const { Paragraph, Text } = Typography;

export const Route = createFileRoute('/dev')({
  component: Dev,
});

export default function Dev() {
  const [pluginName, setPluginName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    status: 'success' | 'error';
    message: string;
  }>(null);

  const installPlugin = () => {
    if (!pluginName.trim()) {
      setResult({ status: 'error', message: '请输入插件名称' });
      return;
    }

    setLoading(true);
    setResult(null); // 清除上一次状态

    window.market
      ?.downloadPlugin({ name: pluginName.trim(), isDev: true })
      .then(() => {
        setResult({
          status: 'success',
          message: `插件 ${pluginName} 安装成功！`,
        });
      })
      .catch((err) => {
        setResult({
          status: 'error',
          message: `插件安装失败：${err?.message || '未知错误'}`,
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>🧪 本地插件开发测试</h2>
      <Paragraph>
        请输入你本地开发的插件名称（package.json 里的 <code>name</code> 字段）：
      </Paragraph>
      <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
        <Input
          placeholder="如 rubick-clipboard"
          style={{ width: 240 }}
          value={pluginName}
          onChange={setPluginName}
          disabled={loading}
        />
        <Button type="primary" loading={loading} onClick={installPlugin}>
          安装插件
        </Button>
      </div>

      {result && (
        <div style={{ marginTop: 16 }}>
          <Text type={result.status === 'error' ? 'danger' : 'success'}>
            {result.message}
          </Text>
        </div>
      )}

      {loading && (
        <div style={{ marginTop: 12 }}>
          <Spin dot />
        </div>
      )}
    </div>
  );
}
