import React, { useState, useEffect } from 'react';

// 定义主题类型
type Theme = 'light' | 'dark' | 'system';

// 创建 ThemeContext
const ThemeContext = React.createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({
  theme: 'system',
  setTheme: () => {},
});

// ThemeProvider 组件
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'system';
  });

  // 检测系统主题偏好
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

  // 根据主题设置 body 类名
  useEffect(() => {
    const currentTheme = theme === 'system' ? systemTheme : theme;
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(currentTheme);
    // 保存主题设置到 localStorage
    localStorage.setItem('theme', theme);
  }, [theme, systemTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 导出主题上下文和提供者
export { ThemeContext, ThemeProvider };
