import React from 'react';
import TimestampConverter from './renderer';
import { TimestampI18nProvider } from './i18n';

interface TimestampPluginProps {
  locale?: 'en' | 'zh';
}

const TimestampPlugin: React.FC<TimestampPluginProps> = ({ locale = 'en' }) => {
  return (
    <TimestampI18nProvider defaultLocale={locale}>
      <TimestampConverter />
    </TimestampI18nProvider>
  );
};

export default TimestampPlugin; 