import { create } from 'zustand'

type LanguageState = {
  language: 'zh-CN' | 'en-US'
  setLanguage: (lang: 'zh-CN' | 'en-US') => void
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'zh-CN',
  setLanguage: (lang) => {
    localStorage.setItem('lang', lang)
    set({ language: lang })
  },
}))
