import { Metadata } from 'next';
import HowToPlayClient from './HowToPlayClient';

export const metadata: Metadata = {
  title: 'How to Play - Learn Stackmoji Game Rules & Instructions',
  description: 'Learn how to play Stackmoji, the daily emoji puzzle game. Complete guide with rules, instructions, and tips to master the emoji guessing challenge.',
  keywords: 'stackmoji tutorial, how to play emoji game, emoji puzzle instructions, stackmoji rules, emoji guessing game guide, daily puzzle help',
  openGraph: {
    title: 'How to Play Stackmoji - Complete Game Guide',
    description: 'Master the daily emoji puzzle with our complete guide. Learn rules, strategies, and tips for Stackmoji.',
    url: 'https://www.stackmoji.com/how-to-play',
  },
  twitter: {
    title: 'How to Play Stackmoji - Complete Game Guide',
    description: 'Master the daily emoji puzzle with our complete guide. Learn rules, strategies, and tips for Stackmoji.',
  },
  alternates: {
    canonical: '/how-to-play',
  },
};

export default function HowToPlayPage() {
  return <HowToPlayClient />;
}