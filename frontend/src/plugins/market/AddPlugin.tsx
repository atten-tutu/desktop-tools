// src/plugins/market/AddPlugin.tsx
import React, { useState } from 'react';
import { useTranslation } from '../../i18n/i18n';
import { Form, Input, Button } from '@arco-design/web-react';
import { usePluginContext } from './PluginContext';
import { Link } from '@tanstack/react-router';

const AddPlugin: React.FC = () => {
  const { t } = useTranslation();
  const { addPlugin } = usePluginContext();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('');
  const [changelog, setChangelog] = useState('');

  const handleSubmit = () => {
    const newPlugin = {
      id: Date.now(), // 使用当前时间戳作为临时 ID
      name,
      description,
      version,
      changelog,
      installed: false
    };
    addPlugin(newPlugin);
    // todo: 未实现逻辑 upload
    // upload(newPlugin); 
    window.location.href = '/market';
  };

  return (
    <div>
      <h2>{t('add_plugin')}</h2>
      <Form layout="vertical">
        <Form.Item label={t('name')}>
          <Input value={name} onChange={(e) => setName(e)} />
        </Form.Item>
        <Form.Item label={t('description')}>
          <Input value={description} onChange={(e) => setDescription(e)} />
        </Form.Item>
        <Form.Item label={t('version')}>
          <Input value={version} onChange={(e) => setVersion(e)} />
        </Form.Item>
        <Form.Item label={t('changelog')}>
          <Input value={changelog} onChange={(e) => setChangelog(e)} />
        </Form.Item>
        <Form.Item>
          <Button onClick={handleSubmit}>{t('save')}</Button>
          <Button onClick={() => window.location.href = '/market'} style={{ marginLeft: 10 }}>{t('cancel')}</Button>
        </Form.Item>
      </Form>
      <Link to="/" className="theme-app-container a">{t('back_to_home')}</Link>
    </div>
  );
};

export default AddPlugin;
