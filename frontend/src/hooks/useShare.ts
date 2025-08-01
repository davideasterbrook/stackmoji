import { DailyGame, HintData } from '@/types';
import { trackEvent } from '@/app/analytics';

interface UseShareParams {
  dailyGame: DailyGame | null;
  guessHistory: string[][];
  hasWon: boolean;
  streak: number;
  hints: HintData[];
}

export function useShare({
  dailyGame,
  guessHistory,
  hasWon,
  streak,
  hints
}: UseShareParams) {
  
  const handleShare = async () => {
    if (!dailyGame) return;
    
    const resultEmojis = guessHistory
      .map((guess, guessIndex) => 
        guess.map(emoji => {
          if (dailyGame.answer.includes(emoji)) {
            const wasHinted = hints.some(h => h.emoji === emoji && h.usedAtGuessNumber <= guessIndex);
            return wasHinted ? '🟧' : '🟩';
          }
          return '🟥';
        }).join('')
      )
      .join('\n');

    const gameUrl = window.location.origin;
    const shareText = `${hasWon ? '✅ '+ guessHistory.length : '❌'}/${3}\n🔥: ${streak}\n\n${resultEmojis}\n\n🎮: ${gameUrl}`;
 
    try {
      if (navigator.share) {
        await navigator.share({
          text: shareText,
        });
        trackEvent('share_results', {
          method: 'share_api',
          won: hasWon,
          attempts: guessHistory.length,
          streak: streak
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert('📋 ✅');
        trackEvent('share_results', {
          method: 'clipboard',
          won: hasWon,
          attempts: guessHistory.length,
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
  };

  return { handleShare };
}