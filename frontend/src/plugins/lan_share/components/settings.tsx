import React from 'react';
import { useTranslation } from '../../../i18n/i18n';

const Settings: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="settings-container">
      {t('settings_coming_soon')}
    </div>
  );
};

export default Settings; 