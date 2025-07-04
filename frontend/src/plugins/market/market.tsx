// src/plugins/market/market.tsx
import React, { useState } from 'react';
import { useTranslation } from '../../i18n/i18n';
import { Input, List, Card, Button, Message } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon'; 
import { PluginProvider, usePluginContext } from './PluginContext';
import { Link } from '@tanstack/react-router';
import { installPlugin } from './install';

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
    const pluginToInstall = plugins.find(plugin => plugin.id === pluginId);
    if (pluginToInstall) {
      try {
        await installPlugin(pluginToInstall.name);
        setInstalledPlugins([...installedPlugins, pluginId]);
        Message.success(`${pluginToInstall.name} 插件安装成功`);
      } catch (error) {
        Message.error(`${pluginToInstall.name} 插件安装失败，请稍后重试`);
      }
    }
  };

  const handleUninstall = (pluginId: number) => {
    setInstalledPlugins(installedPlugins.filter((id) => id!== pluginId));
    // 这里可以添加实际的卸载逻辑
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
