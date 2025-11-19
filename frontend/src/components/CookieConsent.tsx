'use client';

import { useState, useEffect } from 'react';
import { trackEvent } from '@/app/analytics';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if consent has been given
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    } else if (consent === 'true') {
      // Update Google's consent state on initial load if previously consented
      if (typeof window !== 'undefined') {
        const win = window as Window & { gtag?: (command: string, action: string, params: object) => void };
        if (win.gtag) {
          win.gtag('consent', 'update', {
            'analytics_storage': 'granted',
            'functionality_storage': 'granted',
            'personalization_storage': 'granted'
          });
        }
      }
    } else if (consent === 'false') {
      // Ensure consent remains denied if previously rejected
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
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setShowBanner(false);
    
    // Update Google's consent state
    if (typeof window !== 'undefined') {
      const win = window as Window & { gtag?: (command: string, action: string, params: object) => void };
      if (win.gtag) {
        win.gtag('consent', 'update', {
          'analytics_storage': 'granted',
          'functionality_storage': 'granted',
          'personalization_storage': 'granted'
        });
      }
    }
    
    // Track after consent has been granted
    trackEvent('cookie_consent', { action: 'accepted' });
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'false');
    setShowBanner(false);
    
    // Ensure Google's consent state remains denied
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
    
    // Even with rejection, we can still track minimal anonymous data
    // This doesn't use cookies due to our consent settings
    trackEvent('cookie_consent', { action: 'rejected' });
  };

  const handleManagePreferences = () => {
    setShowBanner(true);
  };

  // Expose a global function to manage preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const win = window as Window & { openCookiePreferences?: () => void };
      win.openCookiePreferences = handleManagePreferences;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        const win = window as Window & { openCookiePreferences?: () => void };
        if (win.openCookiePreferences) {
          delete win.openCookiePreferences;
        }
      }
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 theme-panel p-4 shadow-lg z-50 border-t border-solid border-t-[var(--theme-border)]">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm">
            We use cookies for analytics to improve your experience. Your data is stored locally and never shared. 
            Rejecting cookies will not affect site functionality or core game stats.
            <a href="/privacy" className="text-[var(--theme-success)] hover:opacity-80 ml-1">
              Learn more
            </a>
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleReject}
            className="theme-button hover:theme-button-hover px-4 py-2 text-sm font-medium rounded-md"
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--theme-success)] hover:opacity-80 rounded-md"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
} 