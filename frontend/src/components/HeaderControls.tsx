'use client';

import { useTheme } from '@/app/ThemeProvider';
import { useFont } from '@/app/EmojiFontProvider';

export default function HeaderControls() {
  const { toggleTheme, isDarkMode } = useTheme();
  const { toggleFont, useNotoFont } = useFont();

  // Show sun emoji in dark mode (to switch to light), moon in light mode (to switch to dark)
  const themeIcon = isDarkMode ? '☀️' : '🌙';

  return (
    <header className="absolute top-4 left-4 flex gap-2">
      <button
        onClick={toggleTheme}
        className="w-12 h-12 flex items-center justify-center text-2xl rounded-full theme-button relative group"
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        data-emoji="true"
      >
        {themeIcon}
        <span className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {isDarkMode ? 'Light mode' : 'Dark mode'}
        </span>
      </button>

      <button
        onClick={toggleFont}
        className="w-12 h-12 flex items-center justify-center text-2xl rounded-full theme-button relative group"
        aria-label={useNotoFont ? "Switch to system emoji font" : "Switch to Noto Color Emoji font"}
        title={useNotoFont ? "Switch to system emoji font" : "Switch to Noto Color Emoji font"}
        data-emoji="true"
      >
        {useNotoFont ? '👁️' : '👁️'}
        <span className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {useNotoFont ? 'System emoji font' : 'Noto Color Emoji'}
        </span>
      </button>

      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => {
            // Save current streak
            const currentStreak = localStorage.getItem('streak');
            
            // Clear game data
            localStorage.removeItem('dailyGame');
            localStorage.removeItem('lastFetchTime');
            localStorage.removeItem('gameState');
            
            // Clear cookie consent
            localStorage.removeItem('cookieConsent');
            
            // Reset Google Consent Mode to default denied state
            if (typeof window !== 'undefined') {
              const win = window as Window & { gtag?: (command: string, action: string, params: object) => void };
              if (win.gtag) {
                win.gtag('consent', 'update', {
                  'analytics_storage': 'denied',
                  'functionality_storage': 'denied',
                  'personalization_storage': 'denied'
                });
              }
            }
            
            // Restore streak
            if (currentStreak) {
              localStorage.setItem('streak', currentStreak);
            }
            
            window.location.reload();
          }}
          className="w-12 h-12 flex items-center justify-center text-2xl rounded-full theme-button relative group"
          title="Dev: Reset Game"
          aria-label="Developer: Reset Game"
          data-emoji="true"
        >
          🔄
          <span className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black/75 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Reset game data
          </span>
        </button>
      )}
    </header>
  );
} 