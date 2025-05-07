import type { GuessHistoryProps } from '@/types';

export default function GuessHistory({
  guesses = [],
  correctEmojis,
  hints,
  timeUntilMidnight,
  onShare,
  streak
}: GuessHistoryProps) {
  // Helper function to determine if an emoji was hinted before a specific guess
  const wasHintedBeforeGuess = (emoji: string, guessIndex: number) => {
    const hint = hints.find(h => h.emoji === emoji);
    return hint ? hint.usedAtGuessNumber <= guessIndex : false;
  };

  // Check if the user solved the puzzle
  const didSolve = guesses.some(guess => 
    guess.every(emoji => correctEmojis.includes(emoji)) && 
    guess.length === correctEmojis.length
  );

  return (
    <div className="h-full flex flex-col items-center justify-between">
      <div className="flex flex-col items-center gap-4">
        <div className="text-3xl mb-2 flex items-center gap-4">
          {didSolve ? '🥳' : '😭'}
          <span className="text-2xl">•</span>
          <span>🔥 {streak}</span>
        </div>
        <div className="space-y-2">
          {guesses.map((guess, guessIndex) => (
            <div key={guessIndex} className="flex justify-center gap-1">
              {guess.map((emoji, emojiIndex) => {
                const isCorrect = correctEmojis.includes(emoji);
                // Check if this emoji was hinted before this guess
                const wasHinted = wasHintedBeforeGuess(emoji, guessIndex);
                
                const backgroundColor = isCorrect
                  ? wasHinted ? 'bg-[var(--theme-hint)]' : 'bg-[var(--theme-success)]'
                  : 'bg-[var(--theme-error)]';

                return (
                  <div 
                    key={emojiIndex}
                    className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl ${backgroundColor}`}
                  >
                    {emoji}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center">
          <div className="text-2xl mb-1">⏭️ 🎮</div>
          <div className="text-xl font-mono">{timeUntilMidnight}</div>
        </div>
        <button
          onClick={onShare}
          className="bg-[var(--theme-button)] hover:bg-[var(--theme-button-hover)] rounded-xl p-4 transition-colors flex items-center gap-2 w-28 justify-center gentle-pulse button-shine"
          aria-label="Share your results"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="18" cy="18" r="3" />
            <line x1="8.7" y1="12" x2="15.3" y2="7.5" />
            <line x1="8.7" y1="12" x2="15.3" y2="16.5" />
          </svg>
        </button>
      </div>
    </div>
  );
} 