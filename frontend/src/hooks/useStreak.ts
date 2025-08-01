import { useState, useEffect } from 'react';

interface UseStreakReturn {
  streak: number;
  lastPlayedDate: string;
  updateStreakOnGameStart: () => void;
  incrementStreak: () => void;
  resetStreak: () => void;
}

export function useStreak(): UseStreakReturn {
  const [streak, setStreak] = useState<number>(0);
  const [lastPlayedDate, setLastPlayedDate] = useState<string>('');

  // Load streak data from localStorage on mount
  useEffect(() => {
    const savedStreak = localStorage.getItem('streak');
    const savedLastPlayed = localStorage.getItem('lastPlayedDate');
    setStreak(Number(savedStreak) || 0);
    setLastPlayedDate(savedLastPlayed || '');
  }, []);

  // Save streak data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('streak', streak.toString());
    localStorage.setItem('lastPlayedDate', lastPlayedDate);
  }, [streak, lastPlayedDate]);

  const updateStreakOnGameStart = () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Check if we should continue the streak
    if (lastPlayedDate) {
      const lastPlayed = new Date(lastPlayedDate);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If last played date was not yesterday, reset streak
      if (lastPlayed.toISOString().split('T')[0] !== yesterday.toISOString().split('T')[0]) {
        setStreak(0);
      }
    }
    
    // Update the last played date to today
    setLastPlayedDate(todayString);
  };

  const incrementStreak = () => {
    setStreak(prevStreak => prevStreak + 1);
  };

  const resetStreak = () => {
    setStreak(0);
  };

  return {
    streak,
    lastPlayedDate,
    updateStreakOnGameStart,
    incrementStreak,
    resetStreak
  };
}