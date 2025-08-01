import { Dispatch, SetStateAction } from 'react';
import { HintData, GuessData } from '@/types';

interface UseEmojiVisibilityParams {
  revealedEmojis: Set<string>;
  setHiddenEmojis: Dispatch<SetStateAction<Set<string>>>;
  hints: HintData[];
  setHints: Dispatch<SetStateAction<HintData[]>>;
  guesses: GuessData[];  
  hasUsedRevealThisRound: boolean;
  setHasUsedRevealThisRound: Dispatch<SetStateAction<boolean>>;
  isGameComplete: boolean;
}

export function useEmojiVisibility({
  revealedEmojis,
  setHiddenEmojis,
  hints,
  setHints,
  guesses,
  hasUsedRevealThisRound,
  setHasUsedRevealThisRound,
  isGameComplete
}: UseEmojiVisibilityParams) {

  const handleToggleHidden = (emoji: string) => {
    if (!isGameComplete) {
      // During gameplay
      if (revealedEmojis.has(emoji)) {
        if (hints.some(h => h.emoji === emoji)) {
          // For already hinted emojis, just toggle visibility
          setHiddenEmojis((prev: Set<string>) => {
            const newHidden = new Set(prev);
            if (newHidden.has(emoji)) {
              newHidden.delete(emoji);
            } else {
              newHidden.add(emoji);
            }
            return newHidden;
          });
        } else {
          // Only allow one reveal per round
          if (hasUsedRevealThisRound) {
            return;
          }
          // For revealed but not hinted emojis, mark as hint and hide
          setHints((prev: HintData[]) => [...prev, {
            emoji,
            usedAtGuessNumber: guesses.length,
            timestamp: Date.now()
          }]);
          setHiddenEmojis((prev: Set<string>) => new Set([...prev, emoji]));
          setHasUsedRevealThisRound(true);
        }
      }
    } else {
      // After game completion, just toggle visibility
      setHiddenEmojis((prev: Set<string>) => {
        const newHidden = new Set(prev);
        if (newHidden.has(emoji)) {
          newHidden.delete(emoji);
        } else {
          newHidden.add(emoji);
        }
        return newHidden;
      });
    }
  };

  return { handleToggleHidden };
}