import React from 'react';
import { ThemeContext, ThemeProvider } from './theme';
import { Link } from '@tanstack/react-router'; // 引入 Link 组件

// 示例组件，用于切换主题
const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = React.useContext(ThemeContext);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  return (
    <div>
      <button className="theme-button" onClick={() => handleThemeChange('light')}>浅色模式</button>
      <button className="theme-button" onClick={() => handleThemeChange('dark')}>深色模式</button>
      <button className="theme-button" onClick={() => handleThemeChange('system')}>跟随系统</button>
      <p className="theme-info">当前主题: {theme}</p>
      <Link to="/" className="theme-app-container a">退出到主页面</Link> {/* 添加退出按钮 */}
    </div>
  );
};

// 主应用组件
const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="theme-app-container">
        <h1 className="theme-title">主题切换</h1>
        <ThemeSwitcher />
      </div>
    </ThemeProvider>
  );
};

export default App;
