import React, { useState } from 'react';
import { Form, Select, Radio, ColorPicker } from '@arco-design/web-react';
import { useTranslation } from '@/i18n/i18n';

const SystemSettings: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();
  const handleChange = (value: 'zh-CN' | 'en-US' | 'system') => {
    setLanguage(value);
  };

  const [theme, setTheme] = useState('system');

  const languageOptions = [
    { label: t('system'), value: 'system' },
    { label: t('zh_cn'), value: 'zh-CN' },
    { label: t('en_us'), value: 'en-US' },
  ];

  const themeOptions = [
    { label: t('light_mode'), value: 'light' },
    { label: t('dark_mode'), value: 'dark' },
    { label: t('system'), value: 'system' },
  ];

  return (
    <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} style={{ width: '100%' }}>
      <Form.Item label={t('language')}>
        <Select value={language} onChange={handleChange} options={languageOptions} style={{ width: 160 }}>
        </Select>
      </Form.Item>
      <Form.Item label={t('theme')}>
        <Radio.Group type="button" value={theme} onChange={setTheme} style={{ width: '100%' }}>
          {themeOptions.map(opt => (
            <Radio key={opt.value} value={opt.value}>{opt.label}</Radio>
          ))}
        </Radio.Group>
      </Form.Item>
      <Form.Item label={t('skin')}>
        <ColorPicker defaultValue={'#165DFF'} showText />
      </Form.Item>
    </Form>
  );
};

export default SystemSettings;
