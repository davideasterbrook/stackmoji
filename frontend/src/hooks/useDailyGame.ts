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
    const fetchDailyGame = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { gameData, isNewGame: newGame } = await loadDailyGameData();
        
        if (!gameData) {
          setError('Failed to load game data');
          return;
        }

        setDailyGame(gameData);
        setIsNewGame(newGame);
        
        if (newGame) {
          // Clear saved game state for new game
          localStorage.removeItem('gameState');
        }
      } catch (err) {
        console.error('Failed to fetch daily game:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch daily game');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyGame();
  }, []);

  return {
    dailyGame,
    isLoading,
    error,
    isNewGame
  };
}