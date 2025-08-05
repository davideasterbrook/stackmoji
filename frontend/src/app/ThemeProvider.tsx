'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

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
  
  // Initialize with server-safe default to prevent hydration mismatch
  const [theme, setTheme] = useState<string>('dark');
  const [isReady, setIsReady] = useState(false);
  
  const isDarkMode = theme === 'dark';
  
  // Determine initial theme on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storedTheme = localStorage.getItem('theme');
    
    let initialTheme: string;
    if (storedTheme) {
      // User has a saved preference
      initialTheme = storedTheme;
    } else {
      // New user - use browser preference, fallback to dark
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      initialTheme = prefersDark ? 'dark' : 'light';
      // Save the detected preference
      localStorage.setItem('theme', initialTheme);
    }
    
    // Apply theme by setting data-theme attribute (CSS handles the rest)
    document.documentElement.setAttribute('data-theme', initialTheme);
    
    setTheme(initialTheme);
    setIsReady(true);
  }, []);
  
  // Apply theme whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && isReady) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, isReady]);
  
  // Toggle theme function (memoized to prevent re-renders)
  const toggleTheme = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    // Update state (useEffect will handle DOM updates)
    setTheme(newTheme);
    
    // Store in localStorage
    localStorage.setItem('theme', newTheme);
  }, [theme]);
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    theme: theme,
    toggleTheme,
    isDarkMode,
    isReady,
  }), [theme, toggleTheme, isDarkMode, isReady]);
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
} 