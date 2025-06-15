import { Select } from '@arco-design/web-react'
import { useLanguageStore } from '@/stores/useLanguageStore'
import { useTranslation } from 'react-i18next'

const options = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
]

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguageStore()
  const { t } = useTranslation()

  const handleChange = (value: 'zh-CN' | 'en-US') => {
    setLanguage(value)
  }

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
  )
}
