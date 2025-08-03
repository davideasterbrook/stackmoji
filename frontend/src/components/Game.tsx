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
import { useGameLogic } from '@/hooks/useGameLogic';
import { useEmojiVisibility } from '@/hooks/useEmojiVisibility';
import { useGame } from '@/providers/GameProvider';

import { trackPageView } from '@/app/analytics';

function Game() {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const { dailyGame, isLoading, error, isNewGame } = useDailyGame();
  const { state, actions } = useGame();

  const gameLogic = useGameLogic({ dailyGame, gameState: state, gameActions: actions });
  const { handleToggleHidden } = useEmojiVisibility({ dailyGame, gameState: state, gameActions: actions });

  useEffect(() => {
    if (isNewGame && dailyGame) {
      actions.resetGame(dailyGame);
      actions.updateStreakOnStart();
    }
  }, [isNewGame, dailyGame, actions]);

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
              hiddenEmojis={state.hiddenEmojis}
            />
          </section>

          <section className="theme-panel rounded-2xl p-4 h-fit" aria-label="Selected Emojis">
            <SelectedEmojisDisplay
              emojis={state.selectedEmojis}
              correctEmojis={state.correctEmojis}
              isGameComplete={state.isGameComplete}
              dailyGameAnswer={dailyGame.answer}
              onToggleHidden={handleToggleHidden}
              onRemoveEmoji={gameLogic.handleRemoveEmoji}
              guesses={state.guesses}
              hints={state.hints}
              hiddenEmojis={state.hiddenEmojis}
            />
          </section>

          <section className="theme-panel rounded-2xl p-4 h-fit" aria-label={state.isGameComplete ? "Game Results" : "Game Controls"}>
            {!state.isGameComplete ? (
              <GameControls
                emojis={dailyGame.emojis}
                selectedEmojis={state.selectedEmojis}
                correctEmojis={state.correctEmojis}
                incorrectEmojis={state.incorrectEmojis}
                attemptsLeft={state.attemptsLeft}
                requiredCount={dailyGame.required_count}
                onEmojiSelect={gameLogic.handleEmojiSelect}
                onSubmitGuess={gameLogic.handleCheckSolution}
              />
            ) : (
              <GuessHistory
                guesses={state.guesses}
                correctEmojis={dailyGame.answer}
                hints={state.hints}
                dailyGame={dailyGame}
                hasWon={state.hasWon}
                streak={state.streak}
              />
            )}
          </section>
        </div>
      </main>
    </ErrorBoundary>
  );
}

export default Game;