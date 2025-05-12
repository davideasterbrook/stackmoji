interface GameControlsProps {
  options: string[];
  selectedEmojis: string[];
  revealedEmojis: Set<string>;
  incorrectEmojis: Set<string>;
  attemptsLeft: number;
  requiredCount: number;
  onEmojiSelect: (emoji: string) => void;
  onSubmitGuess: () => void;
}

export default function GameControls({
  options,
  selectedEmojis,
  revealedEmojis,
  incorrectEmojis,
  attemptsLeft,
  requiredCount,
  onEmojiSelect,
  onSubmitGuess
}: GameControlsProps) {
  // Check if button should be enabled (all slots filled)
  const isButtonEnabled = selectedEmojis.length === requiredCount && !selectedEmojis.includes('');
  // Check if it's the first attempt (3 attempts left)
  const isFirstAttempt = attemptsLeft === 3;
  // Apply gentle pulse animation only if button is enabled and it's the first attempt
  const shouldPulse = isButtonEnabled && isFirstAttempt;

  return (
    <div className="h-full flex flex-col gap-4">
      <button
        onClick={onSubmitGuess}
        disabled={!isButtonEnabled}
        className={`h-12 rounded-xl text-3xl transition-colors w-[calc(12rem+1rem)] mx-auto border border-[var(--theme-border)] ${
          isButtonEnabled
            ? `theme-button hover:theme-button-hover button-shine ${shouldPulse ? 'gentle-pulse' : ''}`
            : 'bg-transparent disabled:opacity-25 disabled:cursor-not-allowed'
        }`}
      >
        {'💔'.repeat(3 - attemptsLeft) + '❤️'.repeat(attemptsLeft)}
      </button>
      <div className="grid grid-cols-5 gap-1 w-fit mx-auto">
        {options.map((emoji, index) => (
          <button
            key={index}
            onClick={() => onEmojiSelect(emoji)}
            disabled={revealedEmojis.has(emoji) || incorrectEmojis.has(emoji)}
            className={`w-12 h-12 flex items-center justify-center text-3xl rounded-xl transition-colors border border-[var(--theme-border)] ${
              revealedEmojis.has(emoji)
                ? 'success-bg border-none'
                : incorrectEmojis.has(emoji)
                ? 'error-bg border-none'
                : selectedEmojis.includes(emoji)
                ? 'theme-button hover:theme-button-hover border border-[var(--theme-border)]'
                : 'bg-transparent hover:bg-opacity-10 hover:theme-button-inactive-hover'
            }`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
} 