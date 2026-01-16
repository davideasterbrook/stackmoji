import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how Stackmoji handles your data. We use minimal analytics with your consent, store game progress locally, and respect your privacy rights under GDPR.',
  keywords: 'stackmoji privacy, privacy policy, GDPR, cookie policy, data protection, analytics consent',
  openGraph: {
    title: 'Privacy Policy - Stackmoji',
    description: 'Learn how Stackmoji handles your data. Minimal analytics, local storage only, GDPR compliant.',
    url: 'https://www.stackmoji.com/privacy',
  },
  twitter: {
    title: 'Privacy Policy - Stackmoji',
    description: 'Learn how Stackmoji handles your data. Minimal analytics, local storage only, GDPR compliant.',
  },
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
