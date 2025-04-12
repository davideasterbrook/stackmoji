'use client';

import { useState, useEffect } from 'react';
import ShadowDisplay from '@/components/ShadowDisplay';
import { DailyGame, GameState, GuessData, HintData } from '../types';
import SelectedEmojisDisplay from '@/components/SelectedEmojisDisplay';
import GameControls from '@/components/GameControls';
import GuessHistory from '@/components/GuessHistory';
import HelpModal from '@/components/HelpModal';
import { trackPageView, trackEvent } from '@/app/analytics';


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
  const [hiddenEmojis, setHiddenEmojis] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState<number>(0);

  // Initialize with a default value
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Move the theme detection to a useEffect
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  const [guesses, setGuesses] = useState<GuessData[]>([]);
  const [hints, setHints] = useState<HintData[]>([]);

  useEffect(() => {
    const savedStreak = localStorage.getItem('streak');
    setStreak(Number(savedStreak) || 0);
  }, []);

  useEffect(() => {
    localStorage.setItem('streak', streak.toString());
  }, [streak]);

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
        const response = await fetch('https://stackmoji-daily-game.s3.eu-west-1.amazonaws.com/daily-game.json', {
          headers: {
            'Origin': window.location.origin
          }
        });
        const data = await response.json();
        
        const gameData = {
          options: data.options,
          answer: data.answer,
          required_count: data.answer.length
        };

        // Only reset game state when we get a new game
        localStorage.removeItem('gameState');
        setRevealedEmojis(new Set());
        setIncorrectEmojis(new Set());
        setGuessHistory([]);
        setAttemptsLeft(3);
        setIsGameComplete(false);
        setHasWon(false);
        setHiddenEmojis(new Set());
        setGuesses([]);
        setHints([]);
        
        // Initialize selectedEmojis with empty strings based on required count
        setSelectedEmojis(new Array(gameData.required_count).fill(''));
        
        // Save to localStorage
        localStorage.setItem('dailyGame', JSON.stringify(gameData));
        localStorage.setItem('lastFetchTime', now.getTime().toString());
        
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
    // Save theme preference to localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Optional: Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't set a preference
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load saved game state
  useEffect(() => {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      const state: GameState = JSON.parse(savedState);
      setSelectedEmojis(state.selectedEmojis);
      setRevealedEmojis(new Set(state.revealedEmojis));
      setIncorrectEmojis(new Set(state.incorrectEmojis));
      setGuesses(state.guesses || []);  // Ensure we have an empty array if guesses is undefined
      setHints(state.hints || []);      // Ensure we have an empty array if hints is undefined
      setGuessHistory((state.guesses || []).map((g: GuessData) => g.emojis));  // Ensure we have an empty array if guesses is undefined
      setAttemptsLeft(state.attemptsLeft);
      setIsGameComplete(state.isGameComplete);
      setHasWon(state.hasWon);
      setHiddenEmojis(new Set(state.hiddenEmojis || []));
    }
  }, []);

  // Save game state when it changes
  useEffect(() => {
    if (!dailyGame) return;

    const gameState: GameState = {
      selectedEmojis,
      revealedEmojis: Array.from(revealedEmojis),
      incorrectEmojis: Array.from(incorrectEmojis),
      guesses: guesses,
      hints: hints,
      attemptsLeft,
      isGameComplete,
      hasWon,
      hiddenEmojis: Array.from(hiddenEmojis)
    };
    
    localStorage.setItem('gameState', JSON.stringify(gameState));
  }, [selectedEmojis, revealedEmojis, incorrectEmojis, attemptsLeft, isGameComplete, hasWon, dailyGame, hiddenEmojis, guesses, hints]);

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

    // Create new guess data
    const newGuess: GuessData = {
      emojis: [...selectedEmojis],
      timestamp: Date.now(),
      guessNumber: guesses.length + 1
    };

    // Update new state management
    setGuesses(prev => [...prev, newGuess]);

    // Update existing state management
    const currentGuess = [...selectedEmojis];
    setGuessHistory(prev => [...prev, currentGuess]);

    let correctCount = 0;
    const newRevealedEmojis = new Set(revealedEmojis);
    const newIncorrectEmojis = new Set(incorrectEmojis);

    // Create a map of emoji counts in the answer
    const answerCounts = new Map<string, number>();
    dailyGame.answer.forEach((emoji: string) => {
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
      trackEvent('game_won', { 
        attempts: guesses.length + 1,
        guessHistory: guessHistory
      });
      const newStreak = streak + 1;
      setStreak(newStreak);
    } else if (newAttemptsLeft === 0) {
      setIsGameComplete(true);
      setHasWon(false);
      trackEvent('game_lost', {
        finalAttempts: guesses.length + 1,
        guessHistory: guessHistory
      });
      setStreak(0);
    }
  };

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
    const text = `${hasWon ? '✅ '+ guessHistory.length : '❌'}/${3}\n\n${resultEmojis}\n\n🎮: ${gameUrl}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          text: text,
        });
        trackEvent('share_results', {
          method: 'share_api',
          won: hasWon,
          attempts: guessHistory.length
        });
      } else {
        await navigator.clipboard.writeText(text);
        alert('📋 ✅');
        trackEvent('share_results', {
          method: 'clipboard',
          won: hasWon,
          attempts: guessHistory.length
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

  const handleToggleHidden = (emoji: string) => {
    if (!isGameComplete) {
      // During gameplay
      if (revealedEmojis.has(emoji)) {
        if (hints.some(h => h.emoji === emoji)) {
          // For already hinted emojis, just toggle visibility
          setHiddenEmojis(prev => {
            const newHidden = new Set(prev);
            if (newHidden.has(emoji)) {
              newHidden.delete(emoji);
            } else {
              newHidden.add(emoji);
            }
            return newHidden;
          });
        } else {
          // For revealed but not hinted emojis, mark as hint and hide
          setHints(prev => [...prev, {
            emoji,
            usedAtGuessNumber: guesses.length,
            timestamp: Date.now()
          }]);
          setHiddenEmojis(prev => new Set([...prev, emoji]));
        }
      }
    } else {
      // After game completion, just toggle visibility
      setHiddenEmojis(prev => {
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

  const handleRemoveEmoji = (index: number) => {
    const newSelectedEmojis = [...selectedEmojis];
    newSelectedEmojis[index] = '';
    setSelectedEmojis(newSelectedEmojis);
  };

  const handleReset = () => {
    // Keep revealed emojis, clear only non-revealed ones
    const newSelectedEmojis = selectedEmojis.map(emoji => 
      revealedEmojis.has(emoji) ? emoji : ''
    );
    setSelectedEmojis(newSelectedEmojis);
  };

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Add page view tracking
  useEffect(() => {
    trackPageView('/');
  }, []);

  if (isLoading) {
    return (
      <main 
        className="h-screen w-screen p-4 flex items-center justify-center overflow-hidden theme-container" 
        data-theme={isDarkMode ? 'dark' : 'light'}
      >
        <div className="text-4xl animate-bounce">🎮</div>
      </main>
    );
  }

  if (!dailyGame) return null;

  return (
    <main className="h-screen w-screen p-4 flex items-center justify-center overflow-hidden theme-container" aria-label="Emoji Shadows Game">
      <header className="absolute top-4 left-4 flex gap-2">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-12 h-12 flex items-center justify-center text-2xl rounded-full theme-button"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        
        {process.env.NODE_ENV === 'development' && (
          <button
            onClick={() => {
              // Save current streak
              const currentStreak = localStorage.getItem('streak');
              
              // Clear game data
              localStorage.removeItem('dailyGame');
              localStorage.removeItem('lastFetchTime');
              localStorage.removeItem('gameState');
              
              // Clear cookie consent
              localStorage.removeItem('cookieConsent');
              
              // Reset Google Consent Mode to default denied state
              if (typeof window !== 'undefined') {
                const win = window as Window & { gtag?: (command: string, action: string, params: object) => void };
                if (win.gtag) {
                  win.gtag('consent', 'update', {
                    'analytics_storage': 'denied',
                    'functionality_storage': 'denied',
                    'personalization_storage': 'denied'
                  });
                }
              }
              
              // Restore streak
              if (currentStreak) {
                localStorage.setItem('streak', currentStreak);
              }
              
              window.location.reload();
            }}
            className="w-12 h-12 flex items-center justify-center text-2xl rounded-full theme-button"
            title="Dev: Reset Game"
            aria-label="Developer: Reset Game"
          >
            🔄
          </button>
        )}
      </header>

      <nav className="absolute top-4 right-4">
        <button
          onClick={() => setIsHelpModalOpen(true)}
          className="w-12 h-12 flex items-center justify-center text-2xl rounded-full theme-button"
          aria-label="Help"
        >
          ℹ️
        </button>
      </nav>

      <HelpModal 
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <div className="w-full max-w-md h-full flex flex-col gap-2">
        <section className="rounded-2xl p-4 theme-panel h-[35%]" aria-label="Shadow Display">
          <ShadowDisplay
            emojis={dailyGame.answer}
            hiddenEmojis={hiddenEmojis}
          />
        </section>

        <section className="theme-panel rounded-2xl p-4 h-[10%]" aria-label="Selected Emojis">
          <SelectedEmojisDisplay
            emojis={selectedEmojis}
            revealedEmojis={revealedEmojis}
            hiddenEmojis={hiddenEmojis}
            isGameComplete={isGameComplete}
            dailyGameAnswer={dailyGame.answer}
            onToggleHidden={handleToggleHidden}
            onRemoveEmoji={handleRemoveEmoji}
            onReset={handleReset}
            guesses={guesses}
            hints={hints}
          />
        </section>

        <section className="theme-panel rounded-2xl p-4 h-[50%]" aria-label={isGameComplete ? "Game Results" : "Game Controls"}>
          {!isGameComplete ? (
            <GameControls
              options={dailyGame.options}
              selectedEmojis={selectedEmojis}
              revealedEmojis={revealedEmojis}
              incorrectEmojis={incorrectEmojis}
              attemptsLeft={attemptsLeft}
              requiredCount={dailyGame.required_count}
              onEmojiSelect={handleEmojiSelect}
              onSubmitGuess={handleCheckSolution}
            />
          ) : (
            <GuessHistory
              guesses={guesses?.map(g => g.emojis) || []}
              correctEmojis={dailyGame.answer}
              hints={hints}
              timeUntilMidnight={timeUntilMidnight}
              onShare={handleShare}
              streak={streak}
              hiddenEmojis={hiddenEmojis}
            />
          )}
        </section>
      </div>
      
    </main>
  );
}