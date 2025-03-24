'use client';

interface ShadowDisplayProps {
  emojis: string[];
  revealedEmojis: Set<string>;
  isGameComplete: boolean;
  hiddenShadows: Set<string>;
}

export default function ShadowDisplay({ emojis, hiddenShadows }: ShadowDisplayProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {emojis.map((emoji, index) => (
        !hiddenShadows.has(emoji) && (
          <div
            key={index}
            className="absolute"
            style={{
              filter: 'brightness(0)',
              fontSize: '25vh',
            }}
          >
            {emoji}
          </div>
        )
      ))}
    </div>
  );
} 