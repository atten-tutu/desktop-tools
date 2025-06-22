// src/plugins/market/upload.tsx
import React, { useState } from 'react';
import { useTranslation } from '../../i18n/i18n';
import { Input, Button, Space } from '@arco-design/web-react';
import { Link } from '@tanstack/react-router';
import * as fs from 'fs';
import * as path from 'path';
import { usePluginContext } from './PluginContext';

const PluginUploadPage: React.FC = () => {
  const { t } = useTranslation();
  const [zipFilePath, setZipFilePath] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('');
  const { addPlugin } = usePluginContext();

  const handleInstall = async () => {

    try {
      // 确保 installed 文件夹存在
      const installedDir = path.join(__dirname, 'installed');
      if (!fs.existsSync(installedDir)) {
        fs.mkdirSync(installedDir);
      }

      // 拷贝zip文件到 installed 目录
      const destFilePath = path.join(installedDir, `${name}.zip`);
      fs.copyFileSync(zipFilePath, destFilePath);

      // 生成新插件信息
      const newPlugin = {
        id: Date.now(), // 使用时间戳作为唯一 ID
        name,
        description,
        version,
        changelog: '初始版本发布',
        installed: false,
      };

      // 将新插件信息添加到上下文中
      addPlugin(newPlugin);

      // 打印JSON信息，可根据实际需求修改
      console.log(JSON.stringify(newPlugin, null, 2));

      alert('插件安装成功');
    } catch (error) {
      console.error('插件安装失败', error);
      console.log('The final path is:',zipFilePath);
      alert('插件安装失败');
    }
  };

  return (
    <div>
      <h2>{t('add_plugin')}</h2>
      <Input
        placeholder={t('zip_file_path')}
        value={zipFilePath}
        onChange={(value) => setZipFilePath(value)}
      />
      <Input
        placeholder={t('plugin_name')}
        value={name}
        onChange={(value) => setName(value)}
      />
      <Input
        placeholder={t('description')}
        value={description}
        onChange={(value) => setDescription(value)}
      />
      <Input
        placeholder={t('version')}
        value={version}
        onChange={(value) => setVersion(value)}
      />
      <Space>
        <Button onClick={handleInstall}>{t('install')}</Button>
        <Link to="/market">{t('back_to_market')}</Link>
      </Space>
    </div>
  );
};

export default PluginUploadPage;
