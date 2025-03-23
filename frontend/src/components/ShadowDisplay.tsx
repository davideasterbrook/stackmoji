'use client';

interface ShadowDisplayProps {
  emojis: string[];
  revealedEmojis: Set<string>;
  isGameComplete: boolean;
  hiddenShadows: Set<string>;
}

export default function ShadowDisplay({ emojis, isGameComplete, hiddenShadows }: ShadowDisplayProps) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {emojis.map((emoji, index) => (
        !hiddenShadows.has(emoji) && (
          <div
            key={index}
            className="absolute"
            style={{
              filter: 'brightness(0) blur(0px)',
              fontSize: isGameComplete ? '35vh' : '20vh',
            }}
          >
            {emoji}
          </div>
        )
      ))}
    </div>
  );
} 