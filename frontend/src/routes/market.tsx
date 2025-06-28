// src/routes/marketRoot.tsx
import { createFileRoute } from '@tanstack/react-router';
import AppMarketPlugin from '../plugins/market/index';

// 修改导出的路由对象名称为 Route
export const Route = createFileRoute('/market')({
  component: AppMarketPlugin,
});
