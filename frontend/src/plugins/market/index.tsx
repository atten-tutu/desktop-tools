// src/plugins/market/index.tsx
import React from 'react';
import AppMarket from './market';
import { Link } from '@tanstack/react-router';
import { useTranslation } from '@/i18n/i18n';

// 应用市场插件组件，仅引用封装好的市场组件
const AppMarketPlugin: React.FC = () => {

  return <AppMarket />;
};

export default AppMarketPlugin;
