import { Dispatch, SetStateAction } from 'react';
import { DailyGame, GuessData } from '@/types';
import { trackEvent } from '@/app/analytics';

interface UseGameLogicParams {
  dailyGame: DailyGame | null;
  selectedEmojis: string[];
  setSelectedEmojis: Dispatch<SetStateAction<string[]>>;
  revealedEmojis: Set<string>;
  setRevealedEmojis: Dispatch<SetStateAction<Set<string>>>;
  incorrectEmojis: Set<string>;
  setIncorrectEmojis: Dispatch<SetStateAction<Set<string>>>;
  guessHistory: string[][];
  setGuessHistory: Dispatch<SetStateAction<string[][]>>;
  attemptsLeft: number;
  setAttemptsLeft: Dispatch<SetStateAction<number>>;
  setIsGameComplete: Dispatch<SetStateAction<boolean>>;
  setHasWon: Dispatch<SetStateAction<boolean>>;
  guesses: GuessData[];
  setGuesses: Dispatch<SetStateAction<GuessData[]>>;
  setHasUsedRevealThisRound: Dispatch<SetStateAction<boolean>>;
  updateStreakOnGameStart: () => void;
  incrementStreak: () => void;
  resetStreak: () => void;
}

interface UseGameLogicReturn {
  handleEmojiSelect: (emoji: string) => void;
  handleCheckSolution: () => void;
  handleRemoveEmoji: (index: number) => void;
  handleReset: () => void;
}

export function useGameLogic({
  dailyGame,
  selectedEmojis,
  setSelectedEmojis,
  revealedEmojis,
  setRevealedEmojis,
  incorrectEmojis,
  setIncorrectEmojis,
  guessHistory,
  setGuessHistory,
  attemptsLeft,
  setAttemptsLeft,
  setIsGameComplete,
  setHasWon,
  guesses,
  setGuesses,
  setHasUsedRevealThisRound,
  updateStreakOnGameStart,
  incrementStreak,
  resetStreak
}: UseGameLogicParams): UseGameLogicReturn {

  const handleEmojiSelect = (emoji: string) => {
    if (revealedEmojis.has(emoji) || incorrectEmojis.has(emoji)) return;
    if (!dailyGame) return;

    const newSelectedEmojis = [...selectedEmojis];
    
    const existingIndex = newSelectedEmojis.findIndex(e => e === emoji);
    if (existingIndex !== -1 && !revealedEmojis.has(newSelectedEmojis[existingIndex])) {
      newSelectedEmojis[existingIndex] = '';
      setSelectedEmojis(newSelectedEmojis);
      return;
    }

    for (let i = 0; i < dailyGame.required_count; i++) {
      if (revealedEmojis.has(newSelectedEmojis[i])) continue;
      
      if (!newSelectedEmojis[i]) {
        newSelectedEmojis[i] = emoji;
        setSelectedEmojis(newSelectedEmojis);
        return;
      }
    }
  };

  const handleCheckSolution = () => {
    if (!dailyGame || selectedEmojis.length !== dailyGame.required_count) return;

    // Create new guess data
    const newGuess: GuessData = {
      emojis: [...selectedEmojis],
      timestamp: Date.now(),
      guessNumber: guesses.length + 1
    };

    // Update new state management
    setGuesses((prev: GuessData[]) => [...prev, newGuess]);
    
    // Reset reveal usage for next round
    setHasUsedRevealThisRound(false);

    // Update existing state management
    const currentGuess = [...selectedEmojis];
    setGuessHistory((prev: string[][]) => [...prev, currentGuess]);

    let correctCount = 0;
    const newRevealedEmojis = new Set(revealedEmojis);
    const newIncorrectEmojis = new Set(incorrectEmojis);

    // Create a map of emoji counts in the answer
    const answerCounts = new Map<string, number>();
    dailyGame.answer.forEach((emoji: string) => {
      answerCounts.set(emoji, (answerCounts.get(emoji) || 0) + 1);
    });

    selectedEmojis.forEach((emoji) => {
      if (dailyGame.answer.includes(emoji)) {
        correctCount++;
        newRevealedEmojis.add(emoji);
        answerCounts.set(emoji, (answerCounts.get(emoji) || 0) - 1);
      } else {
        newIncorrectEmojis.add(emoji);
      }
    });

    setRevealedEmojis(newRevealedEmojis);
    setIncorrectEmojis(newIncorrectEmojis);
    const newAttemptsLeft = attemptsLeft - 1;
    setAttemptsLeft(newAttemptsLeft);

    const newSelectedEmojis = selectedEmojis.map(emoji => 
      newRevealedEmojis.has(emoji) ? emoji : ''
    );
    setSelectedEmojis(newSelectedEmojis);

    // Check if this is first guess of the day and update streak
    if (guesses.length === 0) {
      updateStreakOnGameStart();
    }

    if (correctCount === dailyGame.required_count) {
      setIsGameComplete(true);
      setHasWon(true);
      trackEvent('game_won', { 
        attempts: guesses.length + 1,
        guessHistory: guessHistory
      });
      incrementStreak();
    } else if (newAttemptsLeft === 0) {
      setIsGameComplete(true);
      setHasWon(false);
      trackEvent('game_lost', {
        finalAttempts: guesses.length + 1,
        guessHistory: guessHistory
      });
      resetStreak();
    }
  };

  const handleRemoveEmoji = (index: number) => {
    const newSelectedEmojis = [...selectedEmojis];
    newSelectedEmojis[index] = '';
    setSelectedEmojis(newSelectedEmojis);
  };

  const handleReset = () => {
    // Keep revealed emojis, clear only non-revealed ones
    const newSelectedEmojis = selectedEmojis.map(emoji => 
      revealedEmojis.has(emoji) ? emoji : ''
    );
    setSelectedEmojis(newSelectedEmojis);
  };

  return {
    handleEmojiSelect,
    handleCheckSolution,
    handleRemoveEmoji,
    handleReset
  };
}