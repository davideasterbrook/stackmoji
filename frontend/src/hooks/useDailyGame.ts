import { useState, useEffect } from 'react';
import { DailyGame } from '@/types';
import { loadDailyGameData } from '@/utils/cacheManager';

interface UseDailyGameReturn {
  dailyGame: DailyGame | null;
  isLoading: boolean;
  error: string | null;
  isNewGame: boolean;
}

export function useDailyGame(): UseDailyGameReturn {
  const [dailyGame, setDailyGame] = useState<DailyGame | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewGame, setIsNewGame] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchDailyGame = async () => {
      try {
        const { gameData, isNewGame: newGame } = await loadDailyGameData();
        
        if (!isMounted) return;
        
        if (!gameData) {
          setError('Failed to load game data');
          setIsLoading(false);
          return;
        }

        setDailyGame(gameData);
        setIsNewGame(newGame);
        setIsLoading(false);
        
        if (newGame) {
          // Clear saved game state for new game
          localStorage.removeItem('gameState');
        }
      } catch (err) {
        console.error('Failed to fetch daily game:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch daily game');
          setIsLoading(false);
        }
      }
    };

    fetchDailyGame();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    dailyGame,
    isLoading,
    error,
    isNewGame
  };
}