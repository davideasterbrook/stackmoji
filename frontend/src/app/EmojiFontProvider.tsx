'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type FontContextType = {
  useNotoFont: boolean;
  toggleFont: () => void;
  isFontLoaded: boolean;
};

const FontContext = createContext<FontContextType>({
  useNotoFont: false,
  toggleFont: () => {},
  isFontLoaded: false,
});

export const useFont = () => useContext(FontContext);

interface FontProviderProps {
  children: ReactNode;
}

export default function FontProvider({ children }: FontProviderProps) {
  const [useNotoFont, setUseNotoFont] = useState<boolean>(false);
  const [isFontLoaded, setIsFontLoaded] = useState<boolean>(false);
  
  // Initialize font preference from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storedFont = localStorage.getItem('useNotoFont');
    const initialUseNoto = storedFont === 'true';
    setUseNotoFont(initialUseNoto);
    
    // Apply font class
    if (initialUseNoto) {
      document.documentElement.classList.add('use-noto-font');
    }

    // Check if Noto font is loaded
    document.fonts.ready.then(() => {
      setIsFontLoaded(true);
    });
  }, []);
  
  // Toggle font function
  const toggleFont = () => {
    if (typeof window === 'undefined') return;
    
    const newUseNoto = !useNotoFont;
    setUseNotoFont(newUseNoto);
    
    // Apply font directly to document
    if (newUseNoto) {
      document.documentElement.classList.add('use-noto-font');
    } else {
      document.documentElement.classList.remove('use-noto-font');
    }
    
    // Store in localStorage
    localStorage.setItem('useNotoFont', newUseNoto.toString());
  };
  
  const contextValue = {
    useNotoFont,
    toggleFont,
    isFontLoaded,
  };
  
  return (
    <FontContext.Provider value={contextValue}>
      {children}
    </FontContext.Provider>
  );
} 