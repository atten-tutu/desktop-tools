import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router'; // 引入 Link 组件
import { useTranslation } from '../i18n/i18n';
import { Space, Button } from '@arco-design/web-react';

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
        <Link to="/theme">{t('theme')}</Link>
        <Link to="/timestamp">{t('timestamp_converter')}</Link>
        <Link to="/market">{t('app_market')}</Link>
        <Button type='outline' onClick={() => navigate({ to: '/settings' })}>{t('settings')}</Button>
      </Space>
    </>
  );
}