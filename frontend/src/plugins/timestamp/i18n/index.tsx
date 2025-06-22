import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './locales/en.json';
import zh from './locales/zh.json';

const translations = {
  en,
  zh,
};

type Locale = keyof typeof translations;

interface I18nContextType {
  t: (key: string) => string;
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

interface I18nProviderProps {
  defaultLocale?: Locale;
  children: React.ReactNode;
}

export const TimestampI18nProvider: React.FC<I18nProviderProps> = ({
  defaultLocale = 'en',
  children,
}) => {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[locale];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const value = {
    t,
    locale,
    setLocale,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTimestampTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTimestampTranslation must be used within a TimestampI18nProvider');
  }
  return context;
}; 