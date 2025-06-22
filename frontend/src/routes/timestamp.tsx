import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import TimestampPlugin from '../plugins/timestamp';
import { useTranslation } from '../i18n/i18n';

export const Route = createFileRoute('/timestamp')({
  component: TimestampPage,
});

function TimestampPage() {
  const { language } = useTranslation();
  
  const currentLocale = language.startsWith('zh') || 
    (language === 'system' && navigator.language.startsWith('zh')) 
    ? 'zh' 
    : 'en';

  return <TimestampPlugin locale={currentLocale} />;
}
