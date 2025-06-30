import type { SelectedEmojisDisplayProps } from '@/types';

export default function SelectedEmojisDisplay({
  emojis,
  revealedEmojis,
  hiddenEmojis,
  isGameComplete,
  dailyGameAnswer,
  onToggleHidden,
  onRemoveEmoji,
  hints
}: SelectedEmojisDisplayProps) {
  // Determine which emojis to display
  const displayEmojis = isGameComplete ? (() => {
    // Start with the last guess
    const lastGuess = [...emojis];
    
    // Find emojis from solution that aren't revealed yet
    const missingEmojis = dailyGameAnswer.filter(emoji => !revealedEmojis.has(emoji));
    let missingIndex = 0;

    // Fill in empty or incorrect spots with missing emojis
    return lastGuess.map(emoji => {
      if (revealedEmojis.has(emoji)) {
        return emoji; // Keep revealed emojis in their positions
      } else {
        // Fill empty or incorrect spots with missing emojis
        return missingEmojis[missingIndex++] || emoji;
      }
    });
  })() : emojis;
  
  return (
    <div className="relative flex justify-center items-center h-full">
      <div className="flex gap-2">
        {displayEmojis.map((emoji, index) => {
          const isRevealed = revealedEmojis.has(emoji);
          const wasHinted = hints.some(h => h.emoji === emoji);
          const wasMissing = isGameComplete && !isRevealed && dailyGameAnswer.includes(emoji);
          
          const buttonColor = isGameComplete
            ? (wasMissing 
                ? 'bg-[var(--theme-error)] border-none'
                : wasHinted 
                  ? 'bg-[var(--theme-hint)] border-none'
                  : 'bg-[var(--theme-success)] border-none')
            : (isRevealed
                ? (wasHinted ? 'bg-[var(--theme-hint)] border-none' : 'bg-[var(--theme-success)] border-none')
                : '');
          
          const isHidden = hiddenEmojis.has(emoji);
          
          return (
            <div 
              key={index}
              onClick={() => {
                if (!isGameComplete) {
                  if (isRevealed) {
                    if (hints.some(h => h.emoji === emoji)) {
                      onToggleHidden(emoji);
                    } else {
                      onToggleHidden(emoji);
                    }
                  } else if (emoji) {
                    onRemoveEmoji(index);
                  }
                } else {
                  onToggleHidden(emoji);
                }
              }}
              className={`w-12 h-12 flex items-center justify-center text-3xl rounded-xl transition-colors stackmoji-font
                ${isGameComplete
                  ? `cursor-pointer ${buttonColor} ${isHidden ? 'opacity-50' : ''}`
                  : isRevealed
                    ? `cursor-pointer ${buttonColor} ${isHidden ? 'opacity-50' : ''}`
                    : emoji 
                      ? 'theme-button hover:theme-button-hover border border-[var(--theme-border)]' 
                      : 'bg-transparent hover:bg-opacity-10 hover:theme-button-inactive-hover border border-[var(--theme-border)]'
                }`}
            >
              {emoji || '❓'}
            </div>
          );
        })}
      </div>
    </div>
  );
} 