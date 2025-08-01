'use client';

import { useState, useEffect } from 'react';
import ShadowDisplay from '@/components/ShadowDisplay';
import SelectedEmojisDisplay from '@/components/SelectedEmojisDisplay';
import GameControls from '@/components/GameControls';
import GuessHistory from '@/components/GuessHistory';
import HelpModal from '@/components/HelpModal';
import StackmojiAnnouncement from '@/components/StackmojiAnnouncement';
import ErrorBoundary from '@/components/ErrorBoundary';

import { useDailyGame } from '@/hooks/useDailyGame';
import { useGameState } from '@/hooks/useGameState';
import { useStreak } from '@/hooks/useStreak';
import { useTimeUntilMidnightUTC } from '@/hooks/useTimeUntilMidnight';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useShare } from '@/hooks/useShare';
import { useEmojiVisibility } from '@/hooks/useEmojiVisibility';

import { trackPageView } from '@/app/analytics';

export default function Game() {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Custom hooks for state management
  const { dailyGame, isLoading, error, isNewGame } = useDailyGame();
  const gameState = useGameState();
  const streak = useStreak();
  const timeUntilMidnight = useTimeUntilMidnightUTC();

  // Game logic hook
  const gameLogic = useGameLogic({
    dailyGame,
    ...gameState,
    ...streak
  });

  // Sharing hook
  const { handleShare } = useShare({
    dailyGame,
    guessHistory: gameState.guessHistory,
    hasWon: gameState.hasWon,
    streak: streak.streak,
    hints: gameState.hints
  });

  // Emoji visibility hook
  const { handleToggleHidden } = useEmojiVisibility({
    revealedEmojis: gameState.revealedEmojis,
    setHiddenEmojis: gameState.setHiddenEmojis,
    hints: gameState.hints,
    setHints: gameState.setHints,
    guesses: gameState.guesses,
    hasUsedRevealThisRound: gameState.hasUsedRevealThisRound,
    setHasUsedRevealThisRound: gameState.setHasUsedRevealThisRound,
    isGameComplete: gameState.isGameComplete
  });

  // Reset game state when new game is loaded
  useEffect(() => {
    if (isNewGame && dailyGame) {
      gameState.resetGameState(dailyGame);
    }
    // ESLint warns about gameState dependency, but we only use gameState.resetGameState
    // which is memoized with useCallback, so it's stable and safe to exclude gameState
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewGame, dailyGame, gameState.resetGameState]);

  // Track page view
  useEffect(() => {
    trackPageView('/');
  }, []);

  // Loading state - show nothing for brief loading
  if (isLoading) {
    return null;
  }

  // Error state
  if (error || !dailyGame) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Failed to load game</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {error || 'Unable to load today\'s puzzle'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <main 
        className="h-screen w-screen p-4 flex items-center justify-center overflow-hidden theme-container overflow-y-auto"
        aria-label="Stackmoji Game"
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
          <section className="rounded-2xl p-4 theme-panel min-h-[35%]" aria-label="Shadow Display">
            <ShadowDisplay
              emojis={dailyGame.answer}
              hiddenEmojis={gameState.hiddenEmojis}
            />
          </section>

          <section className="theme-panel rounded-2xl p-4 h-fit" aria-label="Selected Emojis">
            <SelectedEmojisDisplay
              emojis={gameState.selectedEmojis}
              revealedEmojis={gameState.revealedEmojis}
              hiddenEmojis={gameState.hiddenEmojis}
              isGameComplete={gameState.isGameComplete}
              dailyGameAnswer={dailyGame.answer}
              onToggleHidden={handleToggleHidden}
              onRemoveEmoji={gameLogic.handleRemoveEmoji}
              onReset={gameLogic.handleReset}
              guesses={gameState.guesses}
              hints={gameState.hints}
            />
          </section>

          <section className="theme-panel rounded-2xl p-4 h-fit" aria-label={gameState.isGameComplete ? "Game Results" : "Game Controls"}>
            {!gameState.isGameComplete ? (
              <GameControls
                emojis={dailyGame.emojis}
                selectedEmojis={gameState.selectedEmojis}
                revealedEmojis={gameState.revealedEmojis}
                incorrectEmojis={gameState.incorrectEmojis}
                attemptsLeft={gameState.attemptsLeft}
                requiredCount={dailyGame.required_count}
                onEmojiSelect={gameLogic.handleEmojiSelect}
                onSubmitGuess={gameLogic.handleCheckSolution}
              />
            ) : (
              <GuessHistory
                guesses={gameState.guesses?.map(g => g.emojis) || []}
                correctEmojis={dailyGame.answer}
                hints={gameState.hints}
                timeUntilMidnight={timeUntilMidnight}
                onShare={handleShare}
                streak={streak.streak}
                hiddenEmojis={gameState.hiddenEmojis}
              />
            )}
          </section>
        </div>
      </main>
    </ErrorBoundary>
  );
}