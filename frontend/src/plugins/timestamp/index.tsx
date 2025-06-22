import React from 'react';
import TimestampConverter from './renderer';
import { TimestampI18nProvider } from './i18n';

interface TimestampPluginProps {
  locale?: 'en' | 'zh';
  theme?: 'light' | 'dark' | 'system';
}

const TimestampPlugin: React.FC<TimestampPluginProps> = ({ 
  locale = 'en',
  theme = 'system'
}) => {
  // 检测系统主题偏好
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
  
  // 计算实际主题
  const actualTheme = theme === 'system' ? systemTheme : theme;

  return (
    <TimestampI18nProvider defaultLocale={locale}>
      <div className={`timestamp-plugin ${actualTheme}`}>
        <TimestampConverter />
      </div>
    </TimestampI18nProvider>
  );
};

export default TimestampPlugin; 