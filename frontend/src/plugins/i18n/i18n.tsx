import React, { useState, useEffect } from 'react';
import { ConfigProvider } from '@arco-design/web-react';
import zhCN from '@arco-design/web-react/es/locale/zh-CN';
import enUS from '@arco-design/web-react/es/locale/en-US';
import enUSMessages from './locales/en-US.json';
import zhCNMessages from './locales/zh-CN.json';

type SystemLanguage = 'system';
type AvailableLanguage = 'en-US' | 'zh-CN';
type Language = AvailableLanguage | SystemLanguage;

const localeMap: Record<AvailableLanguage, typeof zhCN> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

// 翻译文本
const messageMap: Record<AvailableLanguage, typeof enUSMessages> = {
  'zh-CN': zhCNMessages,
  'en-US': enUSMessages,
};

const LanguageContext = React.createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof typeof enUSMessages) => string;
}>({
  language: 'system',
  setLanguage: () => {},
  t: (key) => key,
});

const getSystemLanguage = (): AvailableLanguage => {
  const systemLang = navigator.language;
  return systemLang.startsWith('zh') ? 'zh-CN' : 'en-US';
};

// LanguageProvider 组件
const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('system');

  const systemLanguage = getSystemLanguage();

  const currentLanguage: AvailableLanguage = language === 'system' ? systemLanguage : language;

  const t = (key: keyof typeof enUSMessages): string => {
    return messageMap[currentLanguage][key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
    window.dispatchEvent(new CustomEvent('languageChange', { detail: currentLanguage }));
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <ConfigProvider locale={localeMap[currentLanguage]}>
        {children}
      </ConfigProvider>
    </LanguageContext.Provider>
  );
};

const useTranslation = () => {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export { LanguageContext, LanguageProvider, useTranslation }; 