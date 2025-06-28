import React from 'react';
import { ThemeContext } from './theme';
import { Link } from '@tanstack/react-router';
import { Button } from '@arco-design/web-react';
import { useTranslation } from '../../i18n/i18n';

// 示例组件，用于切换主题
const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = React.useContext(ThemeContext);
  const { t } = useTranslation();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  return (
    <div>
      <Button
        style={{ marginRight: 10 }}
        onClick={() => handleThemeChange('light')}
        disabled={theme === 'light'}
      >
        {t('light_mode')}
      </Button>
      <Button
        style={{ marginRight: 10 }}
        onClick={() => handleThemeChange('dark')}
        disabled={theme === 'dark'}
      >
        {t('dark_mode')}
      </Button>
      <Button onClick={() => handleThemeChange('system')} disabled={theme === 'system'}>
        {t('system')}
      </Button>
      <p className="theme-info">{t('current_theme')}: {theme}</p>
      <Link to="/" className="theme-app-container a">{t('back_to_home')}</Link>
    </div>
  );
};

// 主应用组件
const App: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="theme-app-container">
      <h1 className="theme-title">{t('theme')}</h1>
      <ThemeSwitcher />
    </div>
  );
};

export default App;
