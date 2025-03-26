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
  return (
    <div className="h-full flex flex-col justify-between">
      <div className="grid grid-cols-5 gap-1 w-fit mx-auto">
        {options.map((emoji, index) => (
          <button
            key={index}
            onClick={() => onEmojiSelect(emoji)}
            disabled={revealedEmojis.has(emoji) || incorrectEmojis.has(emoji)}
            className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl transition-colors border border-[var(--theme-border)] ${
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

      <button
        onClick={onSubmitGuess}
        disabled={selectedEmojis.length !== requiredCount || selectedEmojis.includes('')}
        className={`h-12 rounded-xl text-3xl transition-colors w-[calc(12rem+1rem)] mx-auto border border-[var(--theme-border)] ${
          selectedEmojis.length === requiredCount && !selectedEmojis.includes('')
            ? 'theme-button hover:theme-button-hover'
            : 'bg-transparent disabled:opacity-25 disabled:cursor-not-allowed'
        }`}
      >
        {'💔'.repeat(3 - attemptsLeft) + '❤️'.repeat(attemptsLeft)}
      </button>
    </div>
  );
} 