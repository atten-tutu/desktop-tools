import React from 'react';
import { useTranslation } from '../../../i18n/i18n';

const DeviceSelector: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="device-selector-container">
      {t('devices_coming_soon')}
    </div>
  );
};

export default DeviceSelector; 