// src/routes/addPlugin.tsx
import { createFileRoute } from '@tanstack/react-router';
import AddPlugin from '../plugins/market/AddPlugin';

// 修改导出的路由对象名称为 Route
export const Route = createFileRoute('/add-plugin')({
  component: AddPlugin,
});
