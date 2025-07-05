// src/components/HomePageLinks.tsx
import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTranslation } from './i18n/i18n';
import { Button, Space } from '@arco-design/web-react';
import './HomePageLinks.css';

const HomePageLinks: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const links = [
    { to: '/theme', label: t('theme') },
    { to: '/timestamp', label: t('timestamp_converter') },
    { to: '/market', label: t('app_market') },
    { to: '/clipboard', label: t('app_clipboard') },
    { to: '/lan-share', label: t('lan_share') },
    { to: '/settings', label: t('settings') },
  ];

  return (
    <div className="scrollable-container">
      <Space direction="vertical" size="large" className="link-space">
        {links.map((link, index) => (
          <Button 
            type='primary'
            style={{width: '100%', height: '40px', borderRadius: '10px'}}
            key={index} 
            onClick={() => navigate({ to: link.to })}
          >
            {link.label}
          </Button>
        ))}
      </Space>
    </div>
  );
};

export default HomePageLinks;
