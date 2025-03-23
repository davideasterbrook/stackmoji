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
        
        setDailyGame(gameData);
      } catch (error) {
        console.error('Failed to fetch daily game:', error);
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

  if (!dailyGame) return null;

  return (
    <main className="h-screen w-screen p-4 flex items-center justify-center overflow-hidden theme-container">
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-4 left-4 w-12 h-12 flex items-center justify-center text-2xl rounded-full theme-button"
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      <div className="w-full max-w-2xl h-full flex flex-col gap-2">
        <div className={`rounded-2xl p-4 theme-panel ${
          isGameComplete ? 'h-[60%]' : 'h-[40%]'
        }`}>
          <ShadowDisplay 
            emojis={dailyGame?.answer || []} 
            revealedEmojis={revealedEmojis}
            isGameComplete={isGameComplete}
            hiddenShadows={hiddenShadows}
          />
        </div>

        {isGameComplete ? (
          <div className="flex-1 rounded-2xl p-4 flex flex-col gap-4 theme-panel">
            <div className="flex justify-center gap-2 mb-4">
              {(hasWon ? guessHistory[guessHistory.length - 1] : (() => {
                const lastGuess = guessHistory[guessHistory.length - 1];
                const answer = [...dailyGame.answer];
                const reorderedAnswer = new Array(answer.length).fill('');
                
                lastGuess.forEach((emoji, index) => {
                  if (dailyGame.answer.includes(emoji)) {
                    reorderedAnswer[index] = emoji;
                    const answerIndex = answer.indexOf(emoji);
                    if (answerIndex !== -1) {
                      answer.splice(answerIndex, 1);
                    }
                  }
                });
                
                let answerIndex = 0;
                reorderedAnswer.forEach((emoji, index) => {
                  if (!emoji && answerIndex < answer.length) {
                    reorderedAnswer[index] = answer[answerIndex];
                    answerIndex++;
                  }
                });
                
                return reorderedAnswer;
              })()).map((emoji, index) => (
                <div 
                  key={index}
                  onClick={() => {
                    setHiddenShadows(prev => {
                      const newHidden = new Set(prev);
                      if (newHidden.has(emoji)) {
                        newHidden.delete(emoji);
                      } else {
                        newHidden.add(emoji);
                      }
                      return newHidden;
                    });
                  }}
                  className={`w-12 h-12 flex items-center justify-center text-2xl bg-green-600 
                    rounded-xl cursor-pointer hover:bg-green-500 transition-colors
                    ${hiddenShadows.has(emoji) ? 'opacity-50' : ''}`}
                >
                  {emoji}
                </div>
              ))}
            </div>

            <div className="flex-1 flex flex-col gap-2 items-center">
              {[...guessHistory].reverse().map((guess, i) => (
                <div key={i} className="flex gap-1">
                  {guess.map((emoji, j) => (
                    <div 
                      key={j}
                      className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl ${
                        dailyGame.answer.includes(emoji) ? 'bg-green-600' : 'bg-red-600'
                      }`}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex gap-4 items-center">
              <div className="flex-1 text-center text-lg flex flex-col gap-1">
                <div>⏭️ 🎮</div>
                <div>{timeUntilMidnight}</div>
              </div>

              <button
                onClick={handleShare}
                className="flex-1 h-12 rounded-xl text-xl theme-button hover:theme-button-hover transition-colors"
              >
                📋
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="theme-panel rounded-2xl p-4">
              <div className="relative flex justify-center items-center">
                <div className="flex gap-2">
                  {Array(dailyGame.required_count).fill(null).map((_, index) => (
                    <div 
                      key={index}
                      onClick={() => {
                        if (selectedEmojis[index] && !revealedEmojis.has(selectedEmojis[index])) {
                          const newSelectedEmojis = [...selectedEmojis];
                          newSelectedEmojis[index] = '';
                          setSelectedEmojis(newSelectedEmojis);
                        }
                      }}
                      className={`w-12 h-12 flex items-center justify-center text-2xl 
                        ${revealedEmojis.has(selectedEmojis[index]) ? 'success-bg' : 
                          selectedEmojis[index] ? 'theme-button hover:theme-button-hover' : 'theme-button-inactive'} 
                        rounded-xl transition-colors`}
                    >
                      {selectedEmojis[index] || '❓'}
                    </div>
                  ))}
                </div>

                {selectedEmojis.some(emoji => emoji && !revealedEmojis.has(emoji)) && (
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

            <div className="theme-panel rounded-2xl p-4">
              <div className="grid grid-cols-5 gap-1 w-fit mx-auto">
                {dailyGame.options.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiSelect(emoji)}
                    disabled={revealedEmojis.has(emoji) || incorrectEmojis.has(emoji)}
                    className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl transition-colors ${
                      revealedEmojis.has(emoji)
                        ? 'success-bg'
                        : incorrectEmojis.has(emoji)
                        ? 'error-bg'
                        : selectedEmojis.includes(emoji)
                        ? 'theme-button hover:theme-button-hover'
                        : 'theme-button-inactive hover:theme-button-inactive-hover'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="theme-panel rounded-2xl p-4">
              <button
                onClick={handleCheckSolution}
                disabled={selectedEmojis.length !== dailyGame?.required_count || selectedEmojis.includes('')}
                className={`h-12 rounded-xl text-3xl transition-colors w-[calc(12rem+1rem)] mx-auto block ${
                  selectedEmojis.length === dailyGame?.required_count && !selectedEmojis.includes('')
                    ? 'theme-button hover:theme-button-hover'
                    : 'theme-button-disabled'
                }`}
              >
                {'💔'.repeat(3 - attemptsLeft) + '❤️'.repeat(attemptsLeft)}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}