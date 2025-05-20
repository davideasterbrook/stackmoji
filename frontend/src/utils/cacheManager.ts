import { DailyGame } from '../types';
import { isSameUTCDay } from './dateUtils';

interface CachedGameData {
  emojis: string[];
  answer: string[];
  required_count: number;
}

async function loadFontFromCache(): Promise<boolean> {
  const cachedFont = localStorage.getItem('stackmojiFont');
  if (!cachedFont) return false;

  try {
    // Convert base64 to array buffer more efficiently
    const binary = atob(cachedFont);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    const fontFace = new FontFace('StackmojiGameFont', bytes.buffer);
    await fontFace.load();
    document.fonts.add(fontFace);
    document.documentElement.style.setProperty('--stackmoji-game-font', 'StackmojiGameFont');
    return true;
  } catch (error) {
    console.error('Failed to load font from cache:', error);
    return false;
  }
}

async function fetchAndCacheFont(): Promise<boolean> {
  try {
    const response = await fetch('https://stackmoji-daily-game.s3.eu-west-1.amazonaws.com/NotoColorEmoji-Stackmoji-Subset.ttf', {
      headers: { 'Origin': window.location.origin }
    });
    
    if (!response.ok) throw new Error('Font fetch failed');
    
    const fontData = await response.arrayBuffer();
    const fontFace = new FontFace('StackmojiGameFont', fontData);
    await fontFace.load();
    document.fonts.add(fontFace);
    
    document.documentElement.style.setProperty('--stackmoji-game-font', 'StackmojiGameFont');
    
    // Convert ArrayBuffer to base64 more efficiently
    const uint8Array = new Uint8Array(fontData);
    let binaryString = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binaryString += String.fromCharCode(uint8Array[i]);
    }
    const base64Font = btoa(binaryString);
    localStorage.setItem('stackmojiFont', base64Font);
    return true;
  } catch (error) {
    console.error('Failed to fetch and cache font:', error);
    return false;
  }
}

export async function loadDailyGameData(): Promise<{ gameData: DailyGame | null; isNewGame: boolean }> {
  if (typeof window === 'undefined') return { gameData: null, isNewGame: false };

  const lastFetch = localStorage.getItem('lastFetchTime');
  const cached = localStorage.getItem('dailyGame');
  const fontLoaded = await loadFontFromCache();

  if (cached && fontLoaded && isSameUTCDay(lastFetch)) {
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
    // If cache is invalid or missing, fetch new data
    const gameResponse = await fetch('https://stackmoji-daily-game.s3.eu-west-1.amazonaws.com/stackmoji-game-data.json', {
      headers: { 'Origin': window.location.origin }
    });

    const data = await gameResponse.json();
    const gameData = {
      emojis: data.emojis,
      answer: data.answer,
      required_count: data.answer.length
    };

    // Save to localStorage
    localStorage.setItem('dailyGame', JSON.stringify(gameData));
    localStorage.setItem('lastFetchTime', new Date().getTime().toString());

    await fetchAndCacheFont();

    return { gameData, isNewGame: true };
  } catch (error) {
    console.error('Failed to fetch game data:', error);
    return { gameData: null, isNewGame: false };
  }
} 