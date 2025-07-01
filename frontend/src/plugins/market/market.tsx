// src/plugins/market/market.tsx
import React, { useState } from 'react';
import { useTranslation } from '../../i18n/i18n';
import { Input, List, Card, Button, Message } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon'; 
import { PluginProvider, usePluginContext } from './PluginContext';
import { Link } from '@tanstack/react-router';
import { myFetch } from '../../utils/api-client';
import { ipcRenderer } from 'electron';

// 修改 API URL，添加 /api 前缀
const INSTALL_API_URL = 'http://localhost:3771/api/install-plugin';
const DOWNLOAD_API_URL = 'http://localhost:3771/api/download-zip';

// 应用市场组件
const AppMarket: React.FC = () => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [installedPlugins, setInstalledPlugins] = useState<number[]>([]);

  // 使用 usePluginContext 获取 plugins
  const { plugins } = usePluginContext();

  const filteredPlugins = plugins.filter((plugin) =>
    plugin.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleInstall = async (pluginId: number) => {
    const targetPlugin = plugins.find((plugin) => plugin.id === pluginId);
    if (!targetPlugin) {
      Message.error('未找到该插件');
      return;
    }

    try {
      // 发送安装插件请求
      const installResponse = await myFetch(INSTALL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: targetPlugin.name }),
      });

      if (installResponse.status === 200) {
        // 发送下载插件请求
        const downloadResponse = await myFetch(`${DOWNLOAD_API_URL}?name=${targetPlugin.name}`, {
          method: 'GET',
        });

        if (downloadResponse.status === 200) {
          const blob = await downloadResponse.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${targetPlugin.name}.zip`;
          a.click();
          window.URL.revokeObjectURL(url);

          setInstalledPlugins([...installedPlugins, pluginId]);
          Message.success('插件安装成功');
        } else {
          Message.error('插件下载失败，请稍后重试');
        }
      } else {
        Message.error('插件安装请求失败，请稍后重试');
      }
    } catch (error) {
      console.error('安装插件失败:', error);
      Message.error('插件安装失败，请稍后重试');
    }
  };

  const handleUninstall = async (pluginId: number) => {
    const targetPlugin = plugins.find((plugin) => plugin.id === pluginId);
    if (!targetPlugin) {
        Message.error('未找到该插件');
        return;
    }

    try {
        // 向主进程发送卸载请求
        const result = await ipcRenderer.invoke('uninstall-plugin', targetPlugin.name);

        if (result.success) {
            setInstalledPlugins(installedPlugins.filter((id) => id!== pluginId));
            Message.success(result.message);
        } else {
            Message.error(result.message);
        }
    } catch (error) {
        // 使用类型守卫进行类型检查
        if (error instanceof Error) {
            console.error('卸载插件失败:', error.message);
        } else {
            console.error('卸载插件失败:', error);
        }
        Message.error('插件卸载失败，请稍后重试');
    }
};


  return (
    <div>
      <h2>{t('app_market')}</h2>
      <Input
        placeholder={t('search_placeholder_for_market')}
        prefix={<IconSearch />} // 使用按需导入的图标
        value={searchText}
        onChange={(value) => setSearchText(value)}
      />
      <Button onClick={() => window.location.href = '/add-plugin'}>
        {t('add_plugin')}
      </Button>
      <List
        dataSource={filteredPlugins}
        render={(item) => (
          <List.Item>
            <Card title={item.name}>
              <p>{item.description}</p>
              <p>{t('version')}: {item.version}</p>
              <p>{t('changelog')}: {item.changelog}</p>
              {installedPlugins.includes(item.id)? (
                <Button onClick={() => handleUninstall(item.id)}>
                  {t('uninstall')}
                </Button>
              ) : (
                <Button onClick={() => handleInstall(item.id)}>
                  {t('install')}
                </Button>
              )}
            </Card>
          </List.Item>
        )}
      />
      <Link to="/" className="theme-app-container a">{t('back_to_home')}</Link>
    </div>
  );
};

const AppMarketWithProvider: React.FC = () => {
  return (
    <PluginProvider>
      <AppMarket />
    </PluginProvider>
  );
};

export default AppMarketWithProvider;
