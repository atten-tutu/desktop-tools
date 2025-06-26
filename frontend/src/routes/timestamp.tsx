import React, { useContext } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import TimestampPlugin from '../plugins/timestamp';
import { useTranslation } from '../i18n/i18n';
import { ThemeContext } from '../plugins/theme/theme';

export const Route = createFileRoute('/timestamp')({
  component: TimestampPage,
});

function TimestampPage() {
  const { language } = useTranslation();
  const { theme } = useContext(ThemeContext);
  
  const currentLocale = language.startsWith('zh') || 
    (language === 'system' && navigator.language.startsWith('zh')) 
    ? 'zh' 
    : 'en';

  return <TimestampPlugin locale={currentLocale} theme={theme} />;
}
