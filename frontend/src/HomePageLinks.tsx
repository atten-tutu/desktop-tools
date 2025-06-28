// src/components/HomePageLinks.tsx
import React from 'react';
import { Link } from '@tanstack/react-router';
import { useTranslation } from './i18n/i18n';
import { Card, Space } from '@arco-design/web-react';
import './HomePageLinks.css';

const HomePageLinks: React.FC = () => {
  const { t } = useTranslation();

  const links = [
    { to: '/theme', label: t('theme') },
    { to: '/timestamp', label: t('timestamp_converter') },
    { to: '/market', label: t('app_market') },
    { to: '/clipboard', label: t('app_clipboard') },
    { to: '/settings', label: t('settings') },
  ];

  return (
    <div className="scrollable-container">
      <Space direction="vertical" size="large" className="link-space">
        {links.map((link, index) => (
          <Card key={index} className="bubble-card">
            <Link to={link.to}>{link.label}</Link>
          </Card>
        ))}
      </Space>
    </div>
  );
};

export default HomePageLinks;
