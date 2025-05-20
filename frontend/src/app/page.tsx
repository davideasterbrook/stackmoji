'use client';

import { useState, useEffect } from 'react';
import ShadowDisplay from '@/components/ShadowDisplay';
import { DailyGame, GameState, GuessData, HintData } from '../types';
import SelectedEmojisDisplay from '@/components/SelectedEmojisDisplay';
import GameControls from '@/components/GameControls';
import GuessHistory from '@/components/GuessHistory';
import HelpModal from '@/components/HelpModal';
import StackmojiAnnouncement from '@/components/StackmojiAnnouncement';
import { trackPageView, trackEvent } from '@/app/analytics';
import { loadDailyGameData } from '@/utils/cacheManager';

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
  const [lastPlayedDate, setLastPlayedDate] = useState<string>('');

  // Font loading state is now handled by the HeaderControls component

  const [guesses, setGuesses] = useState<GuessData[]>([]);
  const [hints, setHints] = useState<HintData[]>([]);

  useEffect(() => {
    const savedStreak = localStorage.getItem('streak');
    const savedLastPlayed = localStorage.getItem('lastPlayedDate');
    setStreak(Number(savedStreak) || 0);
    setLastPlayedDate(savedLastPlayed || '');
  }, []);

  useEffect(() => {
    localStorage.setItem('streak', streak.toString());
    localStorage.setItem('lastPlayedDate', lastPlayedDate);
  }, [streak, lastPlayedDate]);

  useEffect(() => {
    const fetchDailyGame = async () => {
      try {
        setIsLoading(true);
        const { gameData, isNewGame } = await loadDailyGameData();
        
        if (!gameData) {
          console.error('Failed to load game data');
          return;
        }

        if (isNewGame) {
          // Reset game state for new game
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
        }
        
        setDailyGame(gameData);
      } catch (error) {
        console.error('Failed to fetch daily game:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyGame();
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

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    // Check if this is first guess of the day
    if (guesses.length === 0) {
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
    }

    if (correctCount === dailyGame.required_count) {
      setIsGameComplete(true);
      setHasWon(true);
      trackEvent('game_won', { 
        attempts: guesses.length + 1,
        guessHistory: guessHistory
      });
      setStreak(curStreak => curStreak + 1);
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
      <main className="h-screen w-screen p-4 flex flex-col items-center justify-center overflow-hidden theme-container">
        <div className="text-4xl animate-bounce mb-4" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI Emoji"' }}>
          🎮
        </div>
      </main>
    );
  }

  if (!dailyGame) return null;

  return (
    <main 
      className="h-screen w-screen p-4 flex items-center justify-center overflow-hidden theme-container"
      aria-label="Emoji Shadows Game"
      suppressHydrationWarning
    >


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
      
      <StackmojiAnnouncement />

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
              emojis={dailyGame.emojis}
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