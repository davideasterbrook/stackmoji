'use client';

import { useState, useEffect } from 'react';

export default function StackmojiAnnouncement() {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if we're NOT on stackmoji.com
    const shouldShowAnnouncement = () => {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // Show on any domain that isn't stackmoji.com
        return hostname !== 'stackmoji.com' && hostname !== 'www.stackmoji.com';
      }
      return true; // Default to showing during SSR
    };

    const shouldShow = shouldShowAnnouncement();
    
    // Only show the banner if we're not on stackmoji.com and the user hasn't dismissed it
    const dismissed = localStorage.getItem('stackmojiAnnouncementDismissed');
    if (shouldShow && !dismissed) {
      setShowBanner(true);
      // Slight delay for the animation
      setTimeout(() => setIsVisible(true), 500);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for the animation to complete before removing from DOM
    setTimeout(() => {
      localStorage.setItem('stackmojiAnnouncementDismissed', 'true');
      setShowBanner(false);
    }, 300);
  };

  // For development: reset the dismissed state
  const handleReset = () => {
    localStorage.removeItem('stackmojiAnnouncementDismissed');
    window.location.reload();
  };

  if (!showBanner) {
    // In development mode, show a reset button if the banner is dismissed
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={handleReset}
            className="bg-green-600 text-white text-xs px-2 py-1 rounded-md opacity-50 hover:opacity-100"
            title="Reset Stackmoji announcement for testing"
          >
            Reset Announcement
          </button>
        </div>
      );
    }
    return null;
  }

  return (
    <div 
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 theme-panel p-4 shadow-lg z-50 border border-solid border-[var(--theme-border)] rounded-xl max-w-xs w-full transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl animate-bounce">🎮</span>
          <h3 className="text-lg font-medium">stackmoji.com is live!</h3>
        </div>
        <p className="text-sm text-center">
          The main Stackmoji website is now available. Visit the official domain for the best experience!
        </p>
        <div className="flex gap-3 w-full justify-center mt-1">
          <button
            onClick={handleDismiss}
            className="theme-button hover:theme-button-hover px-3 py-1.5 text-sm font-medium rounded-md"
          >
            Dismiss
          </button>
          <a
            href="https://stackmoji.com"
            className="px-3 py-1.5 text-sm font-medium text-white bg-[var(--theme-success)] hover:opacity-80 rounded-md flex items-center gap-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Go to stackmoji.com</span>
            <span>→</span>
          </a>
        </div>
      </div>
      
      {/* For development testing - show the current hostname */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-center opacity-60">
          Current host: {typeof window !== 'undefined' ? window.location.hostname : 'SSR'}
        </div>
      )}
    </div>
  );
} 