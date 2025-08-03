import { Metadata } from 'next';
import "./globals.css";
import Script from 'next/script'
import CookieConsent from '@/components/CookieConsent'
import ThemeProvider from './ThemeProvider';
import HeaderControls from '@/components/HeaderControls';
import { GameProvider } from '@/providers/GameProvider';

export const metadata: Metadata = {
  title: {
    default: 'Stackmoji',
    template: '%s | Stackmoji',
  },
  description: 'Challenge yourself with a fun daily emoji puzzle. Guess which emojis are creating the stack and track your streak!',
  keywords: 'emoji game, daily puzzle, emoji challenge, puzzle game, brain teaser, daily challenge',
  applicationName: 'Stackmoji',
  authors: [{ name: 'Stackmoji' }],
  creator: 'Stackmoji',
  publisher: 'Stackmoji',
  category: 'Entertainment',
  classification: 'Games',
  referrer: 'origin-when-cross-origin',
  generator: 'Next.js',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  metadataBase: new URL('https://www.stackmoji.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Stackmoji',
    description: 'Challenge yourself with a daily emoji puzzle. Guess which emojis are creating the stack and track your streak!',
    url: 'https://www.stackmoji.com',
    siteName: 'Stackmoji',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Stackmoji icon',
        type: 'image/png',
      },
      {
        url: '/og_image.png',
        width: 1200,
        height: 630,
        alt: 'Stackmoji puzzle game',
        type: 'image/png',
      },
      {
        url: '/icon-192.png',
        width: 192,
        height: 192,
        alt: 'Stackmoji icon',
        type: 'image/png',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stackmoji',
    description: 'Challenge yourself with a daily emoji puzzle. Guess which emojis are creating the stack and track your streak!',
    images: ['/og_image.png'],
    // creator: '@yourtwitterhandle',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  // Add Google site verification (replace with your actual code)
  // verification: {
  //   google: 'your-google-site-verification-code',
  // },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Minimal theme script - Just prevents flash by setting initial colors */}
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              // Minimal script to prevent flash of wrong theme
              try {
                let theme = localStorage.getItem('theme');
                if (!theme) {
                  theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  localStorage.setItem('theme', theme);
                }

                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {
                console.error('Theme initialization error:', e);
              }
            `
          }}
        />
        
        <Script id="consent-mode-init" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            
            // Default consent to denied until user provides consent
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'functionality_storage': 'denied',
              'personalization_storage': 'denied',
              'security_storage': 'granted'
            });
          `}
        </Script>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-E9CLESVLV2`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-E9CLESVLV2', {
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false,
              restrict_domain: true,
            });
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': ['WebApplication', 'Game'],
              'name': 'Stackmoji',
              'applicationCategory': 'GameApplication',
              'operatingSystem': 'Web',
              'description': 'A daily emoji puzzle game where players guess which emojis create shadow stacks. Challenge yourself with new puzzles every day and track your streak!',
              'url': 'https://www.stackmoji.com',
              'screenshot': 'https://www.stackmoji.com/screenshot.png',
              'gameGenre': 'Puzzle',
              'playMode': 'SinglePlayer',
              'audience': {
                '@type': 'Audience',
                'audienceType': 'General'
              },
              'offers': {
                '@type': 'Offer',
                'price': '0',
                'priceCurrency': 'USD',
              },
              'aggregateRating': {
                '@type': 'AggregateRating',
                'ratingValue': '4.8',
                'ratingCount': '156',
              },
              'creator': {
                '@type': 'Organization',
                'name': 'Stackmoji',
                'url': 'https://www.stackmoji.com',
              },
              'datePublished': '2025-01-01',
              'inLanguage': 'en-US',
              'isAccessibleForFree': true
            }),
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <GameProvider>
            <HeaderControls />
            {children}
            <CookieConsent />
          </GameProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}