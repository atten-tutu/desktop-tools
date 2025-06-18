import React from 'react';
import ThemePlugin from '../plugins/theme/index';

const PluginsManager: React.FC = () => {
  return (
    <div>
      <h2>插件管理</h2>
      <ThemePlugin />
    </div>
  );
};

export default PluginsManager;
