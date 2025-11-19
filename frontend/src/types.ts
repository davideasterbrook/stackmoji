export interface DailyGame {
    emojis: string[];
    answer: string[];
    required_count: number;
}

export type HintData = Record<string, number>;

export interface GameState {
  selectedEmojis: string[];
  correctEmojis: Set<string>;
  incorrectEmojis: Set<string>;
  attemptsLeft: number;
  isGameComplete: boolean;
  hasWon: boolean;
  guesses: string[][];
  hints: HintData;
  hiddenEmojis: Set<string>;
  hasUsedRevealThisRound: boolean;
  streak: number;
  lastPlayedDate: string;
  isInitialized: boolean;
}

export interface SelectedEmojisDisplayProps {
  emojis: string[];
  correctEmojis: Set<string>;
  isGameComplete: boolean;
  dailyGameAnswer: string[];
  onToggleHidden: (emoji: string) => void;
  onRemoveEmoji: (index: number) => void;
  guesses: string[][];
  hints: HintData;
  hiddenEmojis: Set<string>;
}

export interface GuessHistoryProps {
  guesses: string[][];
  correctEmojis: string[];
  hints: HintData;  // Changed from array to object
  dailyGame: DailyGame;
  hasWon: boolean;
  streak: number;
}

export interface GameControlsProps {
  emojis: string[];
  selectedEmojis: string[];
  correctEmojis: Set<string>;
  incorrectEmojis: Set<string>;
  attemptsLeft: number;
  requiredCount: number;
  onEmojiSelect: (emoji: string) => void;
  onSubmitGuess: () => void;
}

export interface ShadowDisplayProps {
  emojis: string[];
  hiddenEmojis?: Set<string>;
}