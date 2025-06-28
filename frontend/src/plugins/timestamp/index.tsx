import React, { useContext } from 'react';
import TimestampConverter from './renderer';
import { TimestampI18nProvider } from './i18n';
import { ThemeContext } from '../theme/theme';

interface TimestampPluginProps {
  locale?: 'en' | 'zh';
}

const TimestampPlugin: React.FC<TimestampPluginProps> = ({ 
  locale = 'en'
}) => {
  // 使用全局的ThemeContext
  const { theme } = useContext(ThemeContext);
  
  return (
    <TimestampI18nProvider defaultLocale={locale}>
      <div className="timestamp-plugin">
        <TimestampConverter />
      </div>
    </TimestampI18nProvider>
  );
};

export default TimestampPlugin; 