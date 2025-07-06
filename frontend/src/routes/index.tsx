// src/routes/index.tsx
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
import { useState } from 'react';
import Search from '../plugins/search/search';
import HomePageLinks from '@/homepagelinks';
import { IconSettings, IconList } from '@arco-design/web-react/icon';

const { Text } = Typography;
const { market } = window.require('electron');
export const Route = createFileRoute('/')({
  component: App,
});

export default function App() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [showLinks, setShowLinks] = useState(false); // 初始状态设置为 false

  const toggleLinks = () => {
    setShowLinks(!showLinks);
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
  };

  return (
    <div className="homepage-container">
      <div className="left-content">
        <div
          className={`home-page-links ${showLinks ? 'show' : 'hide'}`}
          style={{ display: showLinks ? 'block' : 'none' }}
        >
          <HomePageLinks />
        </div>
        <div className="icon-container">
          <div className="settings-icon" onClick={toggleLinks}>
            <IconList style={{ fontSize: 24, color: '#646cff' }} />
          </div>
          <Link to="/settings" className="settings-icon">
            <IconSettings style={{ fontSize: 24, color: '#646cff' }} />
          </Link>
        </div>
      </div>
      <div className="right-content">
        <div id="search-bar">
          <h1>{t('app_name')}</h1>
          <Search />
        </div>
      </div>
    </div>
  );
}
