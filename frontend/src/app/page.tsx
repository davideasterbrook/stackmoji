'use client';

import { useState, useEffect } from 'react';
import ShadowDisplay from '@/components/ShadowDisplay';
import { DailyGame } from '@/types';


function useTimeUntilMidnightUTC() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setUTCHours(24, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Pad with leading zeros using padStart
      const paddedHours = hours.toString().padStart(2, '0');
      const paddedMinutes = minutes.toString().padStart(2, '0');
      const paddedSeconds = seconds.toString().padStart(2, '0');

      return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return timeLeft;
}

export default function Home() {
  const [dailyGame, setDailyGame] = useState<DailyGame | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);
  const [revealedEmojis, setRevealedEmojis] = useState<Set<string>>(new Set());
  const [incorrectEmojis, setIncorrectEmojis] = useState<Set<string>>(new Set());
  const [guessHistory, setGuessHistory] = useState<string[][]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const timeUntilMidnight = useTimeUntilMidnightUTC();
  const [hiddenShadows, setHiddenShadows] = useState<Set<string>>(new Set());
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const fetchDailyGame = async () => {
      try {
        setIsLoading(true);
        // Check if we have cached data
        const cached = localStorage.getItem('dailyGame');
        const lastFetch = localStorage.getItem('lastFetchTime');
        const now = new Date();
        
        // If we have cached data, check if it's from the current day (UTC)
        if (cached && lastFetch) {
          const lastFetchDate = new Date(parseInt(lastFetch));
          const isSameDay = 
            lastFetchDate.getUTCFullYear() === now.getUTCFullYear() &&
            lastFetchDate.getUTCMonth() === now.getUTCMonth() &&
            lastFetchDate.getUTCDate() === now.getUTCDate();

          if (isSameDay) {
            const cachedGame = JSON.parse(cached);
            setDailyGame(cachedGame);
            return;
          }
        }

        // If no cache or cache is outdated, fetch new data
        const response = await fetch('https://ocvv7pff71.execute-api.eu-west-1.amazonaws.com/daily-game');
        const data = await response.json();
        
        const gameData = {
          options: data.options,
          answer: data.answer,
          required_count: data.answer.length
        };

        // Save to localStorage
        localStorage.setItem('dailyGame', JSON.stringify(gameData));
        localStorage.setItem('lastFetchTime', now.getTime().toString());
        
        // Reset game state when new game is loaded
        localStorage.removeItem('gameState');
        setSelectedEmojis([]);
        setRevealedEmojis(new Set());
        setIncorrectEmojis(new Set());
        setGuessHistory([]);
        setAttemptsLeft(3);
        setIsGameComplete(false);
        setHasWon(false);
        setHiddenShadows(new Set());
        
        setDailyGame(gameData);
      } catch (error) {
        console.error('Failed to fetch daily game:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyGame();
  }, []);

  useEffect(() => {
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Load saved game state
  useEffect(() => {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      const state = JSON.parse(savedState);
      setSelectedEmojis(state.selectedEmojis);
      setRevealedEmojis(new Set(state.revealedEmojis));
      setIncorrectEmojis(new Set(state.incorrectEmojis));
      setGuessHistory(state.guessHistory);
      setAttemptsLeft(state.attemptsLeft);
      setIsGameComplete(state.isGameComplete);
      setHasWon(state.hasWon);
    }
  }, []);

  // Save game state when it changes
  useEffect(() => {
    if (!dailyGame) return;

    const gameState = {
      selectedEmojis,
      revealedEmojis: Array.from(revealedEmojis),
      incorrectEmojis: Array.from(incorrectEmojis),
      guessHistory,
      attemptsLeft,
      isGameComplete,
      hasWon
    };
    
    localStorage.setItem('gameState', JSON.stringify(gameState));
  }, [selectedEmojis, revealedEmojis, incorrectEmojis, guessHistory, attemptsLeft, isGameComplete, hasWon, dailyGame]);

  const handleEmojiSelect = (emoji: string) => {
    if (revealedEmojis.has(emoji) || incorrectEmojis.has(emoji)) return;
    if (!dailyGame) return;

    const newSelectedEmojis = [...selectedEmojis];
    
    const existingIndex = newSelectedEmojis.findIndex(e => e === emoji);
    if (existingIndex !== -1 && !revealedEmojis.has(newSelectedEmojis[existingIndex])) {
      newSelectedEmojis[existingIndex] = '';
      setSelectedEmojis(newSelectedEmojis);
      return;
    }

    for (let i = 0; i < dailyGame.required_count; i++) {
      if (revealedEmojis.has(newSelectedEmojis[i])) continue;
      
      if (!newSelectedEmojis[i]) {
        newSelectedEmojis[i] = emoji;
        setSelectedEmojis(newSelectedEmojis);
        return;
      }
    }
  };

  const handleCheckSolution = () => {
    if (!dailyGame || selectedEmojis.length !== dailyGame.required_count) return;

    const currentGuess = [...selectedEmojis];
    setGuessHistory(prev => [...prev, currentGuess]);

    let correctCount = 0;
    const newRevealedEmojis = new Set(revealedEmojis);
    const newIncorrectEmojis = new Set(incorrectEmojis);

    // Create a map of emoji counts in the answer
    const answerCounts = new Map<string, number>();
    dailyGame.answer.forEach(emoji => {
      answerCounts.set(emoji, (answerCounts.get(emoji) || 0) + 1);
    });

    selectedEmojis.forEach((emoji) => {
      if (dailyGame.answer.includes(emoji)) {
        correctCount++;
        newRevealedEmojis.add(emoji);
        answerCounts.set(emoji, (answerCounts.get(emoji) || 0) - 1);
      } else {
        newIncorrectEmojis.add(emoji);
      }
    });

    setRevealedEmojis(newRevealedEmojis);
    setIncorrectEmojis(newIncorrectEmojis);
    const newAttemptsLeft = attemptsLeft - 1;
    setAttemptsLeft(newAttemptsLeft);

    const newSelectedEmojis = selectedEmojis.map(emoji => 
      newRevealedEmojis.has(emoji) ? emoji : ''
    );
    setSelectedEmojis(newSelectedEmojis);

    if (correctCount === dailyGame.required_count) {
      setIsGameComplete(true);
      setHasWon(true);
    } else if (newAttemptsLeft === 0) {
      setIsGameComplete(true);
      setHasWon(false);
    }
  };

  const handleShare = () => {
    if (!dailyGame) return;
    
    const resultEmojis = guessHistory
      .map(guess => 
        guess.map(emoji => 
          dailyGame.answer.includes(emoji) ? '🟩' : '🟥'
        ).join('')
      )
      .join('\n');

    const text = `${hasWon ? guessHistory.length : 'X'}/${3}\n\n${resultEmojis}`;
    
    navigator.clipboard.writeText(text)
      .then(() => alert('🤷‍♂️'));
  };

  if (isLoading) {
    return (
      <main className="h-screen w-screen p-4 flex items-center justify-center overflow-hidden theme-container">
        <div className="text-4xl animate-bounce">🎮</div>
      </main>
    );
  }

  if (!dailyGame) return null;

  return (
    <main className="h-screen w-screen p-4 flex items-center justify-center overflow-hidden theme-container">
      <div className="absolute top-4 left-4 flex gap-2">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-12 h-12 flex items-center justify-center text-2xl rounded-full theme-button"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => {
              localStorage.removeItem('dailyGame');
              localStorage.removeItem('lastFetchTime');
              localStorage.removeItem('gameState');
              window.location.reload();
            }}
            className="w-12 h-12 flex items-center justify-center text-2xl rounded-full theme-button"
            title="Dev: Reset Game"
          >
            🔄
          </button>
        )}
      </div>

      <div className="w-full max-w-2xl h-full flex flex-col gap-2">
        <div className="rounded-2xl p-4 theme-panel h-[40%]">
          <ShadowDisplay 
            emojis={dailyGame?.answer || []} 
            revealedEmojis={revealedEmojis}
            isGameComplete={isGameComplete}
            hiddenShadows={hiddenShadows}
          />
        </div>

        <div className="theme-panel rounded-2xl p-4 h-[10%]">
          <div className="relative flex justify-center items-center h-full">
            <div className="flex gap-2">
              {Array(dailyGame.required_count).fill(null).map((_, index) => {
                const finalEmoji = isGameComplete ? 
                  (hasWon ? guessHistory[guessHistory.length - 1] : dailyGame.answer)[index] : 
                  selectedEmojis[index];
                
                return (
                  <div 
                    key={index}
                    onClick={() => {
                      if (isGameComplete) {
                        setHiddenShadows(prev => {
                          const newHidden = new Set(prev);
                          if (newHidden.has(finalEmoji)) {
                            newHidden.delete(finalEmoji);
                          } else {
                            newHidden.add(finalEmoji);
                          }
                          return newHidden;
                        });
                      } else if (finalEmoji && !revealedEmojis.has(finalEmoji)) {
                        const newSelectedEmojis = [...selectedEmojis];
                        newSelectedEmojis[index] = '';
                        setSelectedEmojis(newSelectedEmojis);
                      }
                    }}
                    className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl transition-colors border border-[var(--theme-border)]
                      ${isGameComplete ? 
                        `bg-[var(--theme-success)] cursor-pointer hover:bg-[var(--theme-success)] border-none
                         ${hiddenShadows.has(finalEmoji) ? 'opacity-50' : ''}` : 
                        `${revealedEmojis.has(finalEmoji) ? 'success-bg border-none' : 
                          finalEmoji ? 'theme-button hover:theme-button-hover' : 'bg-transparent hover:bg-opacity-10 hover:theme-button-inactive-hover'}`
                      }`}
                  >
                    {finalEmoji || '❓'}
                  </div>
                );
              })}
            </div>

            {/* Reset button */}
            {!isGameComplete && selectedEmojis.some(emoji => emoji && !revealedEmojis.has(emoji)) && (
              <button
                onClick={() => {
                  // Keep revealed emojis, clear only non-revealed ones
                  const newSelectedEmojis = selectedEmojis.map(emoji => 
                    revealedEmojis.has(emoji) ? emoji : ''
                  );
                  setSelectedEmojis(newSelectedEmojis);
                }}
                className="absolute right-0 w-12 h-12 flex items-center justify-center text-2xl theme-button hover:theme-button-hover rounded-xl transition-colors"
              >
                🔄
              </button>
            )}
          </div>
        </div>

        <div className="theme-panel rounded-2xl p-4 h-[50%]">
          {/* Emoji Grid and Guess Button */}
          {!isGameComplete && (
            <div className="h-full flex flex-col justify-between">
              <div className="grid grid-cols-5 gap-1 w-fit mx-auto">
                {dailyGame.options.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiSelect(emoji)}
                    disabled={revealedEmojis.has(emoji) || incorrectEmojis.has(emoji)}
                    className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl transition-colors border border-[var(--theme-border)] ${
                      revealedEmojis.has(emoji)
                        ? 'success-bg border-none'
                        : incorrectEmojis.has(emoji)
                        ? 'error-bg border-none'
                        : selectedEmojis.includes(emoji)
                        ? 'theme-button hover:theme-button-hover border border-[var(--theme-border)]'
                        : 'bg-transparent hover:bg-opacity-10 hover:theme-button-inactive-hover'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCheckSolution}
                disabled={selectedEmojis.length !== dailyGame?.required_count || selectedEmojis.includes('')}
                className={`h-12 rounded-xl text-3xl transition-colors w-[calc(12rem+1rem)] mx-auto border border-[var(--theme-border)] ${
                  selectedEmojis.length === dailyGame?.required_count && !selectedEmojis.includes('')
                    ? 'theme-button hover:theme-button-hover'
                    : 'bg-transparent disabled:opacity-25 disabled:cursor-not-allowed'
                }`}
              >
                {'💔'.repeat(3 - attemptsLeft) + '❤️'.repeat(attemptsLeft)}
              </button>
            </div>
          )}

          {/* Guess History */}
          {isGameComplete && (
            <div className="h-full flex flex-col gap-4">
              <div className="flex-1 flex flex-col gap-2 items-center overflow-y-auto">
                {[...guessHistory].reverse().map((guess, i) => (
                  <div key={i} className="flex gap-1">
                    {guess.map((emoji, j) => (
                      <div 
                        key={j}
                        className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl ${
                          dailyGame.answer.includes(emoji) ? 'bg-[var(--theme-success)]' : 'bg-[var(--theme-error)]'
                        }`}
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex gap-4 items-center mt-4">
                <div className="flex-1 text-center text-lg flex flex-col gap-1">
                  <div>⏭️ 🎮</div>
                  <div>{timeUntilMidnight}</div>
                </div>
                <button
                  onClick={handleShare}
                  className="flex-1 h-12 rounded-xl text-xl theme-button hover:theme-button-hover transition-colors flex items-center justify-center"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}