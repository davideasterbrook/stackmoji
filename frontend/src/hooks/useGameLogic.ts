import { useCallback } from 'react';
import { DailyGame, GameState } from '@/types';
import { trackEvent } from '@/app/analytics';

interface GameActions {
  updateSelectedEmojis: (emojis: string[]) => void;
  submitGuess: (guess: string[], isCorrect: boolean, incorrectEmojis: string[], correctEmojis: string[]) => void;
  completeGame: (hasWon: boolean) => void;
  resetGame: (dailyGame: DailyGame) => void;
  updateStreakOnStart: () => void;
}

interface UseGameLogicParams {
  dailyGame: DailyGame | null;
  gameState: GameState;
  gameActions: GameActions;
}

interface UseGameLogicReturn {
  handleEmojiSelect: (emoji: string) => void;
  handleCheckSolution: () => void;
  handleRemoveEmoji: (index: number) => void;
}

export function useGameLogic({
  dailyGame,
  gameState,
  gameActions
}: UseGameLogicParams): UseGameLogicReturn {

  const handleEmojiSelect = useCallback((emoji: string) => {
    const { selectedEmojis, correctEmojis, incorrectEmojis } = gameState;
    if (correctEmojis.has(emoji) || incorrectEmojis.has(emoji)) return;
    if (!dailyGame) return;

    const newSelectedEmojis = [...selectedEmojis];
    
    const existingIndex = newSelectedEmojis.findIndex(e => e === emoji);
    if (existingIndex !== -1 && !correctEmojis.has(newSelectedEmojis[existingIndex])) {
      newSelectedEmojis[existingIndex] = '';
      gameActions.updateSelectedEmojis(newSelectedEmojis);
      return;
    }

    for (let i = 0; i < dailyGame.required_count; i++) {
      if (correctEmojis.has(newSelectedEmojis[i])) continue;
      
      if (!newSelectedEmojis[i]) {
        newSelectedEmojis[i] = emoji;
        gameActions.updateSelectedEmojis(newSelectedEmojis);
        return;
      }
    }
  }, [gameState, gameActions, dailyGame]);

  const handleCheckSolution = useCallback(() => {
    const { selectedEmojis, guesses, attemptsLeft } = gameState;
    if (!dailyGame || selectedEmojis.length !== dailyGame.required_count) return;

    const guess = [...selectedEmojis];

    let correctCount = 0;
    const incorrectEmojis: string[] = [];
    const correctEmojis: string[] = [];

    selectedEmojis.forEach((emoji) => {
      if (dailyGame.answer.includes(emoji)) {
        correctCount++;
        correctEmojis.push(emoji);
      } else {
        incorrectEmojis.push(emoji);
      }
    });

    const isCorrect = correctCount === dailyGame.required_count;
    gameActions.submitGuess(guess, isCorrect, incorrectEmojis, correctEmojis);

    if (isCorrect) {
      gameActions.completeGame(true);
      trackEvent('game_won', { 
        attempts: guesses.length + 1,
        guessHistory: guesses
      });
    } else if (attemptsLeft === 1) {
      gameActions.completeGame(false);
      trackEvent('game_lost', {
        finalAttempts: guesses.length + 1,
        guessHistory: guesses
      });
    }

    const newSelectedEmojis = selectedEmojis.map(emoji => 
      dailyGame.answer.includes(emoji) ? emoji : ''
    );
    gameActions.updateSelectedEmojis(newSelectedEmojis);
  }, [gameState, gameActions, dailyGame]);

  const handleRemoveEmoji = useCallback((index: number) => {
    const { selectedEmojis } = gameState;
    const newSelectedEmojis = [...selectedEmojis];
    newSelectedEmojis[index] = '';
    gameActions.updateSelectedEmojis(newSelectedEmojis);
  }, [gameState, gameActions]);

  return {
    handleEmojiSelect,
    handleCheckSolution,
    handleRemoveEmoji
  };
}