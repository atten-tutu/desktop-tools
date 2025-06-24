import React, { createContext, useState, useContext, useEffect } from 'react';
import type { SkinType } from './constants';
import { SKIN_COLORS } from './constants';
import { ConfigProvider } from '@arco-design/web-react';

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