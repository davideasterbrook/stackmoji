'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

// Theme values
const DARK_THEME = {
  name: 'dark',
  colors: {
    bg: '#181c21',
    panel: '#252a32',
    text: '#c8cfd7',
    button: '#3d4654',
    buttonHover: '#374151',
    border: '#3d4654',
  }
};

const LIGHT_THEME = {
  name: 'light',
  colors: {
    bg: '#f8fafc',
    panel: '#f1f5f9',
    text: '#3d4654',
    button: '#dae5f2',
    buttonHover: '#cbd5e1',
    border: '#c8cfd7',
  }
};

type ThemeContextType = {
  theme: string;
  toggleTheme: () => void;
  isDarkMode: boolean;
  isReady: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  isDarkMode: true,
  isReady: false,
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  
  // Initialize with a more stable default to prevent hydration issues
  const [theme, setTheme] = useState<string>(() => {
    // Only run this on client side
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      const docTheme = document.documentElement.getAttribute('data-theme');
      return docTheme || storedTheme || 'dark';
    }
    return 'dark'; // Server-side default
  });
  
  const isDarkMode = theme === 'dark';
  
  // Only update theme if it's actually different from what we have
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Get theme from localStorage or data-theme attribute
    const storedTheme = localStorage.getItem('theme');
    const docTheme = document.documentElement.getAttribute('data-theme');
    const initialTheme = docTheme || storedTheme || 'dark';
    
    // Only set theme if it's different to prevent unnecessary re-renders
    if (initialTheme !== theme) {
      setTheme(initialTheme);
    }
  }, [theme]);
  
  // Toggle theme function (memoized to prevent re-renders)
  const toggleTheme = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    const themeConfig = newTheme === 'dark' ? DARK_THEME : LIGHT_THEME;
    
    // Update state
    setTheme(newTheme);
    
    // Apply theme directly to document
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      const cssVarName = `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      document.documentElement.style.setProperty(cssVarName, value);
    });
    
    document.documentElement.style.backgroundColor = themeConfig.colors.bg;
    document.documentElement.style.color = themeConfig.colors.text;
    document.documentElement.classList.remove(theme === 'dark' ? 'dark-theme' : 'light-theme');
    document.documentElement.classList.add(`${newTheme}-theme`);
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Store in localStorage
    localStorage.setItem('theme', newTheme);
  }, [theme]);
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    theme: theme,
    toggleTheme,
    isDarkMode,
    isReady: true, // Always ready now since we initialize properly
  }), [theme, toggleTheme, isDarkMode]);
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
} 