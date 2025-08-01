'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  // Start with null to prevent hydration mismatch
  const [theme, setTheme] = useState<string | null>(null);
  const isDarkMode = theme === 'dark';
  
  // Initialize theme from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Get theme from localStorage or data-theme attribute
    const storedTheme = localStorage.getItem('theme');
    const docTheme = document.documentElement.getAttribute('data-theme');
    
    // Use the document theme if available (set by our script), else use localStorage
    const initialTheme = docTheme || storedTheme || 'dark';
    setTheme(initialTheme);
  }, []);
  
  // Toggle theme function
  const toggleTheme = () => {
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
  };
  
  const contextValue = {
    theme: theme || 'dark', // Default for initial render
    toggleTheme,
    isDarkMode,
    isReady: theme !== null,
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
} 