import { useCallback } from 'react';
import { DailyGame, HintData } from '@/types';
import { trackEvent } from '@/app/analytics';

interface UseShareParams {
  dailyGame: DailyGame | null;
  gameState: {
    guesses: string[][];
    hasWon: boolean;
    streak: number;
    hints: HintData;
  };
}

export function useShare({ dailyGame, gameState }: UseShareParams) {
  
  const handleShare = useCallback(async () => {
    const { guesses, hasWon, streak, hints } = gameState;
    if (!dailyGame) return;
    
    const resultEmojis = guesses
      .map((guess, guessIndex) => 
        guess.map(emoji => {
          if (dailyGame.answer.includes(emoji)) {
            const wasHinted = emoji in hints && hints[emoji] <= guessIndex+1;
            return wasHinted ? '🟧' : '🟩';
          }
          return '🟥';
        }).join('')
      )
      .join('\n');

    const gameUrl = window.location.origin;
    const shareText = `${hasWon ? '✅ '+ guesses.length : '❌'}/${3}\n🔥: ${streak}\n\n${resultEmojis}\n\n🎮: ${gameUrl}`;
 
    try {
      if (navigator.share) {
        await navigator.share({
          text: shareText,
        });
        trackEvent('share_results', {
          method: 'share_api',
          won: hasWon,
          attempts: guesses.length,
          streak: streak
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert('📋 ✅');
        trackEvent('share_results', {
          method: 'clipboard',
          won: hasWon,
          attempts: guesses.length,
          streak: streak
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        alert('❌ 📋');
        trackEvent('share_failed', {
          error: error.message
        });
      }
    }
  }, [dailyGame, gameState]);

  return { handleShare };
}