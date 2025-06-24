import React, { createContext, useState, useContext, useEffect } from 'react';
import type { SkinType } from './constants';
import { SKIN_COLORS } from './constants';
import { ConfigProvider } from '@arco-design/web-react';

// 颜色变体计算函数
const getColorVariants = (hexColor: string) => {
  // 简单的明暗变体计算
  const lighten = (hex: string, amount: number): string => {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.min(255, ((num >> 16) & 0xff) + amount);
    const g = Math.min(255, ((num >> 8) & 0xff) + amount);
    const b = Math.min(255, (num & 0xff) + amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };
  
  const darken = (hex: string, amount: number): string => {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.max(0, ((num >> 16) & 0xff) - amount);
    const g = Math.max(0, ((num >> 8) & 0xff) - amount);
    const b = Math.max(0, (num & 0xff) - amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  return {
    primary: hexColor,
    hover: lighten(hexColor, 20),
    active: darken(hexColor, 20)
  };
};

interface SkinContextType {
  skin: SkinType;
  setSkin: (skin: SkinType) => void;
  primaryColor: string;
}

const defaultSkin: SkinType = 'blue';

export const SkinContext = createContext<SkinContextType>({
  skin: defaultSkin,
  setSkin: () => {},
  primaryColor: SKIN_COLORS[defaultSkin]
});

export const SkinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [skin, setSkin] = useState<SkinType>(() => {
    const savedSkin = localStorage.getItem('skin') as SkinType;
    return savedSkin && Object.keys(SKIN_COLORS).includes(savedSkin) ? savedSkin : defaultSkin;
  });

  const primaryColor = SKIN_COLORS[skin];

  const handleSkinChange = (newSkin: SkinType) => {
    if (Object.keys(SKIN_COLORS).includes(newSkin)) {
      setSkin(newSkin);
    }
  };

  useEffect(() => {
    // 保存主题色设置
    localStorage.setItem('skin', skin);
    
    // 设置全局 CSS 变量（如果需要）
    document.documentElement.style.setProperty('--primary-color', SKIN_COLORS[skin]);
  }, [skin]);

  return (
    <ConfigProvider 
      theme={{ 
        primaryColor: primaryColor,
        // 设置组件特定的主题色
        components: {
          // 图标组件的主题
          Icon: {
            colorPrimary: primaryColor
          }
        }
      }}
    >
      <SkinContext.Provider value={{ skin, setSkin: handleSkinChange, primaryColor }}>
        {children}
      </SkinContext.Provider>
    </ConfigProvider>
  );
};

export const useSkin = () => useContext(SkinContext); 