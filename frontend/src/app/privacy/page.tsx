'use client';

import { useState, useEffect } from 'react';
import { trackPageView } from '../analytics';
import Link from 'next/link';
import { useTheme } from '../ThemeProvider';

export default function PrivacyPolicy() {
  // Use our theme context hook
  const { theme, toggleTheme, isDarkMode } = useTheme();

  useEffect(() => {
    trackPageView('/privacy');
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-6 theme-container" suppressHydrationWarning>
      <div className="flex justify-between items-center mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-blue-500 hover:text-blue-700"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
              clipRule="evenodd" 
            />
          </svg>
          Back to Game
        </Link>
        
        <button
          onClick={toggleTheme}
          className="w-12 h-12 flex items-center justify-center text-2xl rounded-full theme-button"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <section className="mb-8 theme-panel p-4 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Essential Functional Storage</h2>
        <p className="mb-4">
          For the game to function properly, we store the following data locally on your device:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Game progress and statistics (streak, game state)</li>
          <li>User preferences (theme settings)</li>
          <li>Game completion data (wins/losses, attempts)</li>
        </ul>
        <p className="mb-4">
          This data is stored using your browser&apos;s localStorage and is essential for the game to work. It is not transmitted to our servers and cannot be used to identify you.
        </p>
        <p className="mb-4 text-sm opacity-75">
          Note: This essential storage does not require consent as it is necessary for the game to function.
        </p>
      </section>

      <section className="mb-8 theme-panel p-4 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Non-Essential Analytics</h2>
        <p className="mb-4">
          We use Google Analytics to understand how users interact with our game. This is not essential for the game to function and requires your consent. We have configured Google Analytics to minimize data collection:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>IP addresses are anonymized</li>
          <li>No personal data is collected</li>
          <li>No cross-site tracking</li>
          <li>No advertising features</li>
          <li>Google Consent Mode enabled to respect your choices</li>
        </ul>
        <p className="mb-4">
          The data collected includes only:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Game completion events (wins/losses)</li>
          <li>Share button interactions</li>
          <li>Basic usage statistics (page views, session duration)</li>
        </ul>
        <p className="mb-4">
          You can opt-out of analytics tracking using the cookie consent banner. This will not affect the game&apos;s functionality. We implement Google&apos;s Consent Mode to ensure no cookies are set until you provide consent.
        </p>
        <p className="mb-4 text-sm opacity-75">
          Note: Analytics tracking is optional and requires your explicit consent.
        </p>
      </section>

      <section className="mb-8 theme-panel p-4 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Managing Your Cookie Preferences</h2>
        <p className="mb-4">
          You can change your cookie preferences at any time:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Click the button below to open the cookie preferences dialog</li>
          <li>All cookie preferences are stored locally on your device</li>
          <li>Your choices are immediately respected by our analytics systems</li>
        </ul>
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              const win = window as Window & { openCookiePreferences?: () => void };
              if (win.openCookiePreferences) {
                win.openCookiePreferences();
              }
            }
          }}
          className="theme-button hover:theme-button-hover px-4 py-2 text-sm font-medium rounded-md"
        >
          Manage Cookie Preferences
        </button>
      </section>

      {/* <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Advertising</h2>
        <p className="mb-4">
          We display advertisements to support the game's development. Currently, all ads are:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Contextual (based on page content, not user data)</li>
          <li>Non-personalized (not based on user behavior or interests)</li>
          <li>Compliant with privacy regulations</li>
        </ul>
        <p className="mb-4">
          In the future, we may offer an optional enhanced experience with personalized ads. This would:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Require your explicit consent</li>
          <li>Show more relevant advertisements</li>
          <li>Support the game's development more effectively</li>
        </ul>
        <p className="mb-4 text-sm text-gray-600">
          Note: You will always have the choice between non-personalized and personalized ads. Your privacy preferences can be changed at any time.
        </p>
      </section> */}

      <section className="mb-8 theme-panel p-4 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
        <p className="mb-4">
          Under GDPR, you have the right to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Access your personal data</li>
          <li>Request deletion of your data</li>
          <li>Opt-out of analytics tracking</li>
          <li>Withdraw consent at any time</li>
        </ul>
        <p className="mb-4 text-sm opacity-75">
          Note: Essential functional storage cannot be disabled as it is required for the game to work.
        </p>
      </section>

      <section className="mb-8 theme-panel p-4 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
        <p className="mb-4">
          Game data is stored locally on your device and can be cleared by:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Clearing your browser&apos;s local storage</li>
          <li>Using the browser&apos;s &quot;Clear Site Data&quot; option</li>
        </ul>
        <p className="mb-4 text-sm opacity-75">
          Note: Clearing this data will reset your game progress and preferences.
        </p>
      </section>

      <section className="mb-8 theme-panel p-4 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Contact</h2>
        <p className="mb-4">
          If you have any questions about this privacy policy please contact us at contact@launchcraft.co.uk.
        </p>
      </section>

      <p className="text-sm opacity-75">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </main>
  );
} 