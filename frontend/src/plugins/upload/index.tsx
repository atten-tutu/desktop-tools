// src/plugins/market/index.tsx
import React from 'react';
import UploadFolder from './upload';

// 应用市场插件组件，仅引用封装好的市场组件
const UploadPlugin: React.FC = () => {
  return <UploadFolder />;
};

export default UploadPlugin;
