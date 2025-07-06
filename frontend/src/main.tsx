// src/main.tsx
import React from 'react';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import '@arco-design/web-react/dist/css/arco.css';

// Import the generated route tree
import { routeTree } from './routeTree.gen.ts';

import './index.css';

// Language
import { LanguageProvider } from './i18n/i18n.tsx';
import { SkinProvider } from './plugins/skin/context';
import { PluginProvider } from './plugins/market/PluginContext';
import { ThemeProvider } from './plugins/theme/theme';

// 懒加载首页组件
const LazyIndexRoute = React.lazy(() => import('./routes/index'));

// 检查 routeTree.children 是否存在
if (routeTree.children && routeTree.children.IndexRoute) {
  // 修改 routeTree 中的首页路由组件
  routeTree.children.IndexRoute = routeTree.children.IndexRoute.update({
    component: () => (
      <React.Suspense fallback={<div>Loading...</div>}>
        <LazyIndexRoute />
      </React.Suspense>
    ),
  });
}

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Listen for language changes
const AppWrapper = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <SkinProvider>
          <PluginProvider>
            <RouterProvider router={router} />
          </PluginProvider>
        </SkinProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);

// // Use contextBridge
// window.ipcRenderer.on('main-process-message', (_event, message) => {
//   console.log(message);
// });
