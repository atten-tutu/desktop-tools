import { createFileRoute } from '@tanstack/react-router';
// import { Link } from '@tanstack/react-router'; // 引入 Link 组件
import { useTranslation } from '../i18n/i18n';
import { Space, Link } from '@arco-design/web-react';
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: App,
});

export default function App() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <h1>{t('app_name')}</h1>
      <Space>
        <Link onClick={() => navigate({ to: '/theme' })}>{t('theme')}</Link>
        <Link onClick={() => navigate({ to: '/timestamp' })}>{t('timestamp_converter')}</Link>
        <Link onClick={() => navigate({ to: '/market' })}>{t('app_market')}</Link>
        <Link onClick={() => navigate({ to: '/settings' })}>{t('settings')}</Link>
      </Space>
    </>
  );
}
