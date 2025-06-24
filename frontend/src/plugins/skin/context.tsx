import React, { createContext, useState, useContext, useEffect } from 'react';
import type { SkinType } from './constants';
import { SKIN_COLORS } from './constants';
import { ConfigProvider } from '@arco-design/web-react';

interface SkinContextType {
  skin: SkinType;
  setSkin: (skin: SkinType) => void;
}

const defaultSkin: SkinType = 'blue';

export const SkinContext = createContext<SkinContextType>({
  skin: defaultSkin,
  setSkin: () => {},
});

export const SkinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [skin, setSkin] = useState<SkinType>(() => {
    const savedSkin = localStorage.getItem('skin') as SkinType;
    return savedSkin && Object.keys(SKIN_COLORS).includes(savedSkin) ? savedSkin : defaultSkin;
  });

  const handleSkinChange = (newSkin: SkinType) => {
    if (Object.keys(SKIN_COLORS).includes(newSkin)) {
      setSkin(newSkin);
    }
  };

  useEffect(() => {
    // 保存主题色设置
    localStorage.setItem('skin', skin);
  }, [skin]);

  return (
    <ConfigProvider theme={{ primaryColor: SKIN_COLORS[skin] }}>
      <SkinContext.Provider value={{ skin, setSkin: handleSkinChange }}>
        {children}
      </SkinContext.Provider>
    </ConfigProvider>
  );
};

export const useSkin = () => useContext(SkinContext); 