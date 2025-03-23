'use client';

interface ResultsModalProps {
  isOpen: boolean;
  correctEmojis: Set<string>;
  guessHistory: string[][];
  onShare: () => void;
  onClose: () => void;
  hasWon: boolean;
}

export default function ResultsModal({
  isOpen,
  correctEmojis,
  guessHistory,
  onShare,
  onClose,
  hasWon
}: ResultsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1f2e] rounded-2xl p-6 max-w-sm w-full">
        {/* Result Emoji */}
        <div className="text-center text-6xl mb-6">
          {hasWon ? '🎉' : '😢'}
        </div>

        {/* Guess History */}
        <div className="space-y-2 mb-6">
          {guessHistory.map((guess, i) => (
            <div key={i} className="flex justify-center gap-1">
              {guess.map((emoji, j) => (
                <div key={j} className="text-2xl">
                  {correctEmojis.has(emoji) ? '🟩' : '🟥'}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={onShare}
            className="bg-[#232733] hover:bg-[#2a2f3e] rounded-xl p-4 text-2xl transition-colors"
          >
            📋
          </button>
          <button
            onClick={onClose}
            className="bg-[#232733] hover:bg-[#2a2f3e] rounded-xl p-4 text-2xl transition-colors"
          >
            ❌
          </button>
        </div>
      </div>
    </div>
  );
} 