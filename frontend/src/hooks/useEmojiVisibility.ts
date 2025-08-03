import { useCallback } from 'react';
import { DailyGame, GameState } from '@/types';

interface GameActions {
  addHint: (emoji: string, guessRound: number) => void;
  toggleEmojiVisibility: (emoji: string) => void;
}

interface UseEmojiVisibilityParams {
  dailyGame: DailyGame | null;
  gameState: GameState;
  gameActions: GameActions;
}

export function useEmojiVisibility({
  dailyGame,
  gameState,
  gameActions
}: UseEmojiVisibilityParams) {

  const handleToggleHidden = useCallback((emoji: string) => {
    const { isGameComplete, correctEmojis, hasUsedRevealThisRound, hints, guesses } = gameState;
    if (!dailyGame) return;

    if (!isGameComplete) {
      // During gameplay - only allow interacting with correct emojis
      if (correctEmojis.has(emoji)) {
        const isAlreadyHinted = emoji in hints;
        
        if (isAlreadyHinted) {
          // Already hinted - just toggle visibility (no new hint)
          gameActions.toggleEmojiVisibility(emoji);
        } else {
          // Not hinted yet - add hint if we haven't used one this round
          if (!hasUsedRevealThisRound) {
            const currentRound = guesses.length + 1; // Current round (1-indexed)
            gameActions.addHint(emoji, currentRound);
            gameActions.toggleEmojiVisibility(emoji); // Also hide it
          }
          // If already used hint this round, do nothing
        }
      }
    } else {
      // Post-game: allow toggling any correct emoji's visibility (no hint tracking)
      if (dailyGame.answer.includes(emoji)) {
        gameActions.toggleEmojiVisibility(emoji);
      }
    }
  }, [dailyGame, gameState, gameActions]);

  return { handleToggleHidden };
}