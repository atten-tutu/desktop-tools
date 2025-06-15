import { StrictMode, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen.ts'

import { ConfigProvider } from '@arco-design/web-react'
import './index.css'
import '@arco-design/web-react/dist/css/arco.css';

// Language
import zhCN from '@arco-design/web-react/es/locale/zh-CN'
import enUS from '@arco-design/web-react/es/locale/en-US'
import './i18n'
import { useLanguageStore } from './stores/useLanguageStore'



// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Listen for language changes
const AppWrapper = () => {
  const { language } = useLanguageStore()
  const arcoLocale = language === 'zh-CN' ? zhCN : enUS

  // 确保 i18n 同步
  useEffect(() => {
    import('i18next').then(({ default: i18n }) => {
      if (i18n.language !== language) {
        i18n.changeLanguage(language)
      }
    })
  }, [language])

  return (
    <ConfigProvider locale={arcoLocale}>
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
)

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message)
})
