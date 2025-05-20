export interface DailyGame {
    emojis: string[];
    answer: string[];
    required_count: number;
}

export interface GuessData {
  emojis: string[];        // The emojis used in this guess
  timestamp: number;       // When this guess was made
  guessNumber: number;     // The sequential number of this guess (1, 2, 3)
}

export interface HintData {
  emoji: string;           // The emoji that was hinted
  usedAtGuessNumber: number; // After which guess number the hint was used
  timestamp: number;       // When the hint was used
}

export interface GameState {
  guesses: GuessData[];
  hints: HintData[];
  revealedEmojis: string[];
  incorrectEmojis: string[];
  attemptsLeft: number;
  isGameComplete: boolean;
  hasWon: boolean;
  hiddenEmojis: string[];
  selectedEmojis: string[];
}

export interface SelectedEmojisDisplayProps {
  emojis: string[];
  revealedEmojis: Set<string>;
  hiddenEmojis: Set<string>;
  isGameComplete: boolean;
  dailyGameAnswer: string[];
  onToggleHidden: (emoji: string) => void;
  onRemoveEmoji: (index: number) => void;
  onReset: () => void;
  guesses: GuessData[];
  hints: HintData[];
}

export interface GuessHistoryProps {
  guesses: string[][];
  correctEmojis: string[];
  hiddenEmojis?: Set<string>;
  hints: HintData[];
  timeUntilMidnight: string;
  onShare: () => void;
  streak: number;
}

export interface GameControlsProps {
  emojis: string[];
  selectedEmojis: string[];
  revealedEmojis: Set<string>;
  incorrectEmojis: Set<string>;
  attemptsLeft: number;
  requiredCount: number;
  onEmojiSelect: (emoji: string) => void;
  onSubmitGuess: () => void;
}

export interface ShadowDisplayProps {
  emojis: string[];
  hiddenEmojis: Set<string>;
  revealedEmojis?: Set<string>;
  isGameComplete?: boolean;
}