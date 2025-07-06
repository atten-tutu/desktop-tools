// src/routes/index.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router'; // 引入 Link 组件
import { useTranslation } from '../i18n/i18n';
import { Space, Button } from '@arco-design/web-react';
import { ipcRenderer } from 'electron';
import { useState } from 'react';
import Search from '../plugins/search/search';
import HomePageLinks from '@/HomePageLinks'
import { IconSettings, IconList } from '@arco-design/web-react/icon';

export const Route = createFileRoute('/')({
  component: App,
});

export default function App() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showLinks, setShowLinks] = useState(false); // 初始状态设置为 false

  const toggleLinks = () => {
    setShowLinks(!showLinks);
  };

  return (
    <div className="homepage-container">
      <div className="left-content">
        <div className={`home-page-links ${showLinks ? 'show' : 'hide'}`} style={{ display: showLinks ? 'block' : 'none' }}>
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
