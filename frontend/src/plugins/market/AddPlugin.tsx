import React, { useState } from 'react';
import { useTranslation } from '../../i18n/i18n';
import { Form, Input, Button } from '@arco-design/web-react';
import { usePluginContext } from './PluginContext';
import { Link } from '@tanstack/react-router';
import { upload } from './upload';

const AddPlugin: React.FC = () => {
  const { t } = useTranslation();
  const { addPlugin } = usePluginContext();
  // 初始化状态变量
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('');
  const [changelog, setChangelog] = useState('');

  const handleSubmit = () => {
    const newPlugin = {
      id: Date.now(), // 使用当前时间戳作为临时 ID
      // 使用状态变量的值来创建 newPlugin 对象
      name,
      description,
      version,
      changelog,
      installed: false
    };
    addPlugin(newPlugin);
    // todo: 未实现逻辑 upload
    upload(newPlugin); 
    window.location.href = '/market';
  };

  return (
    <div>
      <h2>{t('add_plugin')}</h2>
      <Form layout="vertical">
        <Form.Item label={t('name')}>
          {/* 修改 onChange 事件处理函数，接收 value 参数 */}
          <Input value={name} onChange={(value) => setName(value)} />
        </Form.Item>
        <Form.Item label={t('description')}>
          {/* 修改 onChange 事件处理函数，接收 value 参数 */}
          <Input value={description} onChange={(value) => setDescription(value)} />
        </Form.Item>
        <Form.Item label={t('version')}>
          {/* 修改 onChange 事件处理函数，接收 value 参数 */}
          <Input value={version} onChange={(value) => setVersion(value)} />
        </Form.Item>
        <Form.Item label={t('changelog')}>
          {/* 修改 onChange 事件处理函数，接收 value 参数 */}
          <Input value={changelog} onChange={(value) => setChangelog(value)} />
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
