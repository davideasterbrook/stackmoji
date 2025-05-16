'use client';

import type { ShadowDisplayProps } from '@/types';

export default function ShadowDisplay({ 
  emojis = [], 
  hiddenEmojis = new Set(),
}: Pick<ShadowDisplayProps, 'emojis' | 'hiddenEmojis'>) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {(emojis || []).map((emoji, index) => (
        !hiddenEmojis.has(emoji) && (
          <div
            key={index}
            className="absolute"
            data-emoji="true"
            style={{
              filter: 'brightness(0)',
              fontSize: '25vh',
              fontFamily: 'var(--emoji-fonts)',
              WebkitFontFeatureSettings: '"liga" 0, "calt" 0',
              fontFeatureSettings: '"liga" 0, "calt" 0',
              textRendering: 'optimizeLegibility',
            }}
          >
            {emoji}
          </div>
        )
      ))}
    </div>
  );
} 