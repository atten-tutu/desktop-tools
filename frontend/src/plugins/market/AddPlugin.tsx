import React, { useState } from 'react';
import { useTranslation } from '../../i18n/i18n';
import { Form, Input, Button, Upload } from '@arco-design/web-react';
import { usePluginContext } from './PluginContext';
import { Link } from '@tanstack/react-router';
import { upload, uploadZip } from './upload';

const AddPlugin: React.FC = () => {
  const { t } = useTranslation();
  const { addPlugin } = usePluginContext();
  // 初始化状态变量
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('');
  const [changelog, setChangelog] = useState('');
  const [zipFile, setZipFile] = useState<File | null>(null);

  const handleSubmit = async () => {
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
    await upload(newPlugin); 

    if (zipFile) {
      await uploadZip(zipFile);
    }

    window.location.href = '/market';
  };

  const handleFileChange = (info: any) => {
    if (info.file.status === 'done') {
      setZipFile(info.file.originFileObj);
    }
  };

  return (
    <div>
      <h2>{t('add_plugin')}</h2>
      <Form layout="vertical">
        <Form.Item label={t('name')}>
          <Input value={name} onChange={(value) => setName(value)} />
        </Form.Item>
        <Form.Item label={t('description')}>
          <Input value={description} onChange={(value) => setDescription(value)} />
        </Form.Item>
        <Form.Item label={t('version')}>
          <Input value={version} onChange={(value) => setVersion(value)} />
        </Form.Item>
        <Form.Item label={t('changelog')}>
          <Input value={changelog} onChange={(value) => setChangelog(value)} />
        </Form.Item>
        <Form.Item label="插件压缩包">
          <Upload
            action="#"
            onChange={handleFileChange}
            showUploadList={false}
          >
            <Button>{t('select_file')}</Button>
          </Upload>
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
