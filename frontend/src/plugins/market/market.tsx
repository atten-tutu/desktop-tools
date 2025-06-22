// src/plugins/market/market.tsx
import React, { useState } from 'react';
import { useTranslation } from '../../i18n/i18n';
import { Input, List, Card, Button, Space } from '@arco-design/web-react';
import { IconSearch } from '@arco-design/web-react/icon';
import { Link } from '@tanstack/react-router';
import { usePluginContext } from './PluginContext';

// 应用市场组件
const AppMarket: React.FC = () => {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState('');
  const [installedPlugins, setInstalledPlugins] = useState<number[]>([]);
  const { plugins } = usePluginContext();

  const filteredPlugins = plugins.filter((plugin) =>
    plugin.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleInstall = (pluginId: number) => {
    setInstalledPlugins([...installedPlugins, pluginId]);
    // 这里可以添加实际的安装逻辑
  };

  const handleUninstall = (pluginId: number) => {
    setInstalledPlugins(installedPlugins.filter((id) => id!== pluginId));
    // 这里可以添加实际的卸载逻辑
  };

  return (
    <div>
      <h2>{t('app_market')}</h2>
      <Space>
        <Input
          placeholder={t('search_placeholder_for_market')}
          prefix={<IconSearch />} // 使用按需导入的图标
          value={searchText}
          onChange={(value) => setSearchText(value)}
        />
        <Link to="/upload">{t('add_plugin')}</Link>
      </Space>
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
    </div>
  );
};

export default AppMarket;
