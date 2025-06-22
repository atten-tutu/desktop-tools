import React, { useEffect, useState } from 'react';
import TimestampConverter from './renderer';
import { TimestampI18nProvider } from './i18n';

interface TimestampPluginProps {
  locale?: 'en' | 'zh';
}

const TimestampPlugin: React.FC<TimestampPluginProps> = ({ 
  locale = 'en'
}) => {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const bodyClasses = document.body.classList;
    if (!bodyClasses.contains('light') && !bodyClasses.contains('dark')) {
      bodyClasses.add(systemTheme);
      return () => {
        bodyClasses.remove(systemTheme);
      };
    }
  }, [systemTheme]);

  return (
    <TimestampI18nProvider defaultLocale={locale}>
      <div className="timestamp-plugin">
        <TimestampConverter />
      </div>
    </TimestampI18nProvider>
  );
};

export default TimestampPlugin; 