import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router'; // 引入 Link 组件
import { LanguageSwitcher } from '../plugins/i18n';
import { useTranslation } from '../plugins/i18n/i18n';

export const Route = createFileRoute('/')({
  component: App,
});

export default function App() {
  const { t } = useTranslation();

  return (
    <>
      <h1>{t('app_name')}</h1>
      <div style={{ marginBottom: '20px' }}>
        <LanguageSwitcher />
      </div>
      <Link to="/theme">{t('theme')}</Link> {/* 添加导航链接 */}
    </>
  );
}
