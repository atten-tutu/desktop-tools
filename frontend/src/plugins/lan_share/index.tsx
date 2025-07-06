import React, { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Tabs, Button, Badge, Layout, Modal } from '@arco-design/web-react';
import { IconHome, IconPoweroff, IconSettings } from '@arco-design/web-react/icon';
import { useTranslation } from '../../i18n/i18n';
import ChatInterface from './components/chat_interface';
import DeviceSelector from './components/device_selector';
import Settings from './components/settings';
import { useLanShare } from './context/LanShareContext';
import './styles/index.css';
import Header from '@arco-design/web-react/es/Layout/header';
import { useSkin } from '../skin/context';
import Content from '@arco-design/web-react/es/Layout/content';

// 局域网共享插件主组件
const LanSharePlugin: React.FC = () => {
  const { t } = useTranslation();
  const { isServiceRunning, toggleService } = useLanShare();
  const { primaryColor } = useSkin();
  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <Layout style={{ height: '100vh', width: '100vw' }}>    
      <Header style={{ display: 'flex', alignItems: 'center', padding: 12, backgroundColor: 'var(--color-bg-2)'}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
              <IconHome style={{ fontSize: 28, color: primaryColor }} />
            </Link>
            <h2 style={{ margin: 0 }}>{t('lan_share')}</h2>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
            <Button 
              type={isServiceRunning ? "outline" : "primary"}
              status={isServiceRunning ? "danger" : "success"}
              onClick={toggleService}
              icon={<IconPoweroff />}
            >
              {isServiceRunning ? t('stop_service') : t('start_service')}
            </Button>
            <Button onClick={() => setSettingsVisible(true)}>              
              <IconSettings />              
            </Button>
          </div>
      </Header>
      <Content style={{ padding: 20, overflow: 'hidden', backgroundColor: 'var(--color-bg-1)' }}>
          <ChatInterface />
      </Content>

      <Modal
        title={t('settings')}
        visible={settingsVisible}
        onOk={() => setSettingsVisible(false)}
        onCancel={() => setSettingsVisible(false)}
        autoFocus={false}
        maskClosable={false}
      >
        <Settings />
      </Modal>
    </Layout>
  );
};

export default LanSharePlugin; 