import { DailyGame } from '../types';
import { isSameUTCDay } from './dateUtils';

interface CachedGameData {
  emojis: string[];
  answer: string[];
  required_count: number;
}

// Font is now loaded via CSS @font-face declaration in globals.css

export async function loadDailyGameData(): Promise<{ gameData: DailyGame | null; isNewGame: boolean }> {
  console.log('loadDailyGameData called');
  if (typeof window === 'undefined') return { gameData: null, isNewGame: false };

  const lastFetch = localStorage.getItem('lastFetchTime');
  const cached = localStorage.getItem('dailyGame');

  // Check if we have valid cached data from today
  if (cached && isSameUTCDay(lastFetch)) {
    const cachedGame = JSON.parse(cached) as CachedGameData;
    
    return {
      gameData: {
        emojis: cachedGame.emojis,
        answer: cachedGame.answer,
        required_count: cachedGame.required_count
      },
      isNewGame: false
    };
  }

  try {
    // Fetch new data from static assets
    const gameResponse = await fetch('/stackmoji-game-data.json');
    if (!gameResponse.ok) throw new Error('Failed to fetch game data');

    const data = await gameResponse.json();
    const gameData = {
      emojis: data.emojis,
      answer: data.answer,
      required_count: data.answer.length
    };

    // Save to localStorage for today
    localStorage.setItem('dailyGame', JSON.stringify(gameData));
    localStorage.setItem('lastFetchTime', new Date().getTime().toString());

    return { gameData, isNewGame: true };
  } catch (error) {
    console.error('Failed to fetch game data:', error);
    return { gameData: null, isNewGame: false };
  }
} 