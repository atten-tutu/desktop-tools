// src/plugins/market/upload.tsx
import React, { useState } from 'react';
import { useTranslation } from '../../i18n/i18n';
import { Input, Button, Space } from '@arco-design/web-react';
import { Link } from '@tanstack/react-router';
import * as fs from 'fs';
import * as path from 'path';
import { Stats } from 'fs';

const PluginUploadPage: React.FC = () => {
  const { t } = useTranslation();
  const [rootDir, setRootDir] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('');

  const handleInstall = () => {
    const installedDir = path.join(__dirname, 'installed', name);
    try {
      // 确保 installed 文件夹存在
      if (!fs.existsSync(path.join(__dirname, 'installed'))) {
        fs.mkdirSync(path.join(__dirname, 'installed'));
      }
      // 确保目标文件夹存在
      if (!fs.existsSync(installedDir)) {
        fs.mkdirSync(installedDir);
      }
      // 拷贝文件
      const copyRecursiveSync = (src: string, dest: string) => {
        const exists = fs.existsSync(src);
        const stats = exists && fs.statSync(src);
        if (stats instanceof Stats && stats.isDirectory()) {
          fs.mkdirSync(dest);
          fs.readdirSync(src).forEach((childItemName) => {
            copyRecursiveSync(
              path.join(src, childItemName),
              path.join(dest, childItemName)
            );
          });
        } else if (exists) {
          fs.copyFileSync(src, dest);
        }
      };
      copyRecursiveSync(rootDir, installedDir);
      alert('插件安装成功');
    } catch (error) {
      console.error('插件安装失败', error);
      alert('插件安装失败');
    }
  };

  return (
    <div>
      <h2>{t('add_plugin')}</h2>
      <Input
        placeholder={t('root_directory')}
        value={rootDir}
        onChange={(value) => setRootDir(value)}
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
