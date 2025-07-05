import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { Tabs, Button, Badge, Layout, Modal, Tooltip } from '@arco-design/web-react';
import { IconHome, IconPoweroff, IconSettings, IconCheckCircle, IconCloseCircle } from '@arco-design/web-react/icon';
import { useTranslation } from '../../i18n/i18n';
import ChatInterface from './components/chat_interface';
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
  const settingsFormRef = useRef<{ submit: () => void }>(null);
  
  // 保存设置
  const handleSaveSettings = () => {
    if (settingsFormRef.current) {
      settingsFormRef.current.submit();
      setSettingsVisible(false);
    }
  };

  // 添加调试信息
  useEffect(() => {
    console.log(`Current service status: ${isServiceRunning}`);
  }, [isServiceRunning]);

  return (
    <Layout style={{ height: '100vh', width: '100vw' }}>    
      <Header style={{ display: 'flex', alignItems: 'center', padding: 12, backgroundColor: 'var(--color-bg-2)'}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
              <IconHome style={{ fontSize: 28, color: primaryColor }} />
            </Link>
            <h2 style={{ margin: 0 }}>{t('lan_share')}</h2>
            
            {/* 服务状态指示器 */}
            <Tooltip content={isServiceRunning ? "服务已启动" : "服务未启动"}>
              {isServiceRunning ? 
                <IconCheckCircle style={{ fontSize: 18, color: 'green' }} /> : 
                <IconCloseCircle style={{ fontSize: 18, color: 'red' }} />
              }
            </Tooltip>
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
        title="设置"
        visible={settingsVisible}
        onOk={handleSaveSettings}
        okText="保存"
        onCancel={() => setSettingsVisible(false)}
        autoFocus={false}
        maskClosable={false}
      >
        <Settings formRef={settingsFormRef} />
      </Modal>
    </Layout>
  );
};

export default LanSharePlugin; 