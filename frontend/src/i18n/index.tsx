import React from 'react';
import { Select } from '@arco-design/web-react';
import { useTranslation } from './i18n';

const options = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
  { label: '跟随系统', value: 'system' },
];

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();

  const handleChange = (value: 'zh-CN' | 'en-US' | 'system') => {
    setLanguage(value);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <span style={{ flex: 1 }}>{t('language')}:</span>
      <Select
        style={{ width: 120 }}
        value={language}
        onChange={handleChange}
        options={options}
      />
    </div>
  );
};

export default LanguageSwitcher;
