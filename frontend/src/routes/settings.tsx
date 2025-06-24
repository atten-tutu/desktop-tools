import React from 'react';
import { Link } from '@tanstack/react-router';
import { Layout, Menu, Form } from '@arco-design/web-react';
import Header from '@arco-design/web-react/es/Layout/header';
import Content from '@arco-design/web-react/es/Layout/content';
import Sider from '@arco-design/web-react/es/Layout/sider';
import { IconHome, IconSettings, IconUser } from '@arco-design/web-react/icon';
import { useTranslation } from '@/i18n/i18n';
import SystemSettings from './settings/SystemSettings';
import { createFileRoute } from '@tanstack/react-router';
import { ThemeProvider } from '../plugins/theme/theme';
import { useSkin } from '../plugins/skin/context';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const [selectedKey, setSelectedKey] = React.useState('0');  
  const { primaryColor } = useSkin();

  return (
    <ThemeProvider>
      <Layout style={{ height: '100vh', width: '100vw' }}>
        <Header style={{ display: 'flex', alignItems: 'center', gap: 12, margin: 12 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <IconHome style={{ fontSize: 28, color: primaryColor }} />
          </Link>
          <h2 style={{ margin: 0 }}>{t('settings')}</h2>
        </Header>
        <Form layout="horizontal" style={{ width: '100%', height: '100%' }}>
          <Layout>
            <Sider
              style={{
                width: '25vw',
              }}
            >
              <Menu
                style={{
                  width: '100%',
                  borderRadius: 4,
                }}
                selectedKeys={[selectedKey]}
                onClickMenuItem={setSelectedKey}
              >
                <Menu.Item key='0'><IconSettings style={{ color: primaryColor }} />{t('system_settings')}</Menu.Item>
                <Menu.Item key='1'><IconUser style={{ color: primaryColor }} />{t('account_center')}</Menu.Item>
              </Menu>
            </Sider>
            <Content>
              {selectedKey === '0' && <SystemSettings />}
              {selectedKey === '1' && <div>这里是账户中心页面内容</div>}
            </Content>
          </Layout>
        </Form>
      </Layout>
    </ThemeProvider>
  );
};

export const Route = createFileRoute('/settings')({
  component: Settings,
});
