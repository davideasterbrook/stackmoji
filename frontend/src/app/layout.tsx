import { Metadata } from 'next';
import "./globals.css";
import Script from 'next/script'
import CookieConsent from '@/components/CookieConsent'
import ThemeProvider from './ThemeProvider';

export const metadata: Metadata = {
  title: {
    default: 'Stackmoji',
    template: '%s | Stackmoji',
  },
  description: 'Challenge yourself with a fun daily emoji puzzle. Guess which emojis are creating the stack and track your streak!',
  keywords: 'emoji game, daily puzzle, emoji challenge',
  applicationName: 'Stackmoji',
  authors: [{ name: 'Stackmoji' }],
  creator: 'Stackmoji',
  publisher: 'Stackmoji',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
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
    title: 'Stackmoji | 🙈👀❓',
    description: 'Challenge yourself with a daily emoji puzzle. Guess which emojis are creating the stack and track your streak!',
    url: 'https://www.stackmoji.com',
    siteName: 'Stackmoji',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Stackmoji puzzle game',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Stackmoji | 🙈👀❓',
    description: 'Challenge yourself with a daily emoji puzzle. Guess which emojis are creating the stack and track your streak!',
    images: ['/og-image.png'],
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
              '@type': 'WebApplication',
              'name': 'Stackmoji',
              'applicationCategory': 'GameApplication',
              'operatingSystem': 'Web',
              'description': 'A daily emoji puzzle game. Guess which emojis are creating the stack each day.',
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
              'screenshot': 'https://www.stackmoji.com/screenshot.png',
              'author': {
                '@type': 'Organization',
                'name': 'Stackmoji',
                'url': 'https://www.stackmoji.com',
              },
            }),
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  )
}