import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
import { DailyGame, GameState, GuessData, HintData } from '@/types';

interface UseGameStateReturn {
  selectedEmojis: string[];
  setSelectedEmojis: Dispatch<SetStateAction<string[]>>;
  revealedEmojis: Set<string>;
  setRevealedEmojis: Dispatch<SetStateAction<Set<string>>>;
  incorrectEmojis: Set<string>;
  setIncorrectEmojis: Dispatch<SetStateAction<Set<string>>>;
  guessHistory: string[][];
  setGuessHistory: Dispatch<SetStateAction<string[][]>>;
  attemptsLeft: number;
  setAttemptsLeft: Dispatch<SetStateAction<number>>;
  isGameComplete: boolean;
  setIsGameComplete:  Dispatch<SetStateAction<boolean>>;
  hasWon: boolean;
  setHasWon: Dispatch<SetStateAction<boolean>>;
  hiddenEmojis: Set<string>;
  setHiddenEmojis: Dispatch<SetStateAction<Set<string>>>;
  guesses: GuessData[];
  setGuesses: Dispatch<SetStateAction<GuessData[]>>;
  hints: HintData[];
  setHints: Dispatch<SetStateAction<HintData[]>>;
  hasUsedRevealThisRound: boolean;
  setHasUsedRevealThisRound: Dispatch<SetStateAction<boolean>>;
  resetGameState: (dailyGame: DailyGame | null) => void;
}

export function useGameState(): UseGameStateReturn {
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);
  const [revealedEmojis, setRevealedEmojis] = useState<Set<string>>(new Set());
  const [incorrectEmojis, setIncorrectEmojis] = useState<Set<string>>(new Set());
  const [guessHistory, setGuessHistory] = useState<string[][]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [hiddenEmojis, setHiddenEmojis] = useState<Set<string>>(new Set());
  const [guesses, setGuesses] = useState<GuessData[]>([]);
  const [hints, setHints] = useState<HintData[]>([]);
  const [hasUsedRevealThisRound, setHasUsedRevealThisRound] = useState(false);

  const resetGameState = useCallback((dailyGame: DailyGame | null) => {
    if (!dailyGame) return;
    
    setRevealedEmojis(new Set());
    setIncorrectEmojis(new Set());
    setGuessHistory([]);
    setAttemptsLeft(3);
    setIsGameComplete(false);
    setHasWon(false);
    setHiddenEmojis(new Set());
    setGuesses([]);
    setHints([]);
    setHasUsedRevealThisRound(false);
    setSelectedEmojis(new Array(dailyGame.required_count).fill(''));
  }, []);

  // Load saved game state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      try {
        const state: GameState = JSON.parse(savedState);
        setSelectedEmojis(state.selectedEmojis);
        setRevealedEmojis(new Set(state.revealedEmojis));
        setIncorrectEmojis(new Set(state.incorrectEmojis));
        setGuesses(state.guesses || []);
        setHints(state.hints || []);
        setGuessHistory((state.guesses || []).map((g: GuessData) => g.emojis));
        setAttemptsLeft(state.attemptsLeft);
        setIsGameComplete(state.isGameComplete);
        setHasWon(state.hasWon);
        setHiddenEmojis(new Set(state.hiddenEmojis || []));
        setHasUsedRevealThisRound(state.hasUsedRevealThisRound || false);
      } catch (error) {
        console.error('Failed to load saved game state:', error);
      }
    }
  }, []);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    const gameState: GameState = {
      selectedEmojis,
      revealedEmojis: Array.from(revealedEmojis),
      incorrectEmojis: Array.from(incorrectEmojis),
      guesses,
      hints,
      attemptsLeft,
      isGameComplete,
      hasWon,
      hiddenEmojis: Array.from(hiddenEmojis),
      hasUsedRevealThisRound
    };
    
    localStorage.setItem('gameState', JSON.stringify(gameState));
  }, [selectedEmojis, revealedEmojis, incorrectEmojis, attemptsLeft, isGameComplete, hasWon, hiddenEmojis, guesses, hints, hasUsedRevealThisRound]);

  return {
    selectedEmojis,
    setSelectedEmojis,
    revealedEmojis,
    setRevealedEmojis,
    incorrectEmojis,
    setIncorrectEmojis,
    guessHistory,
    setGuessHistory,
    attemptsLeft,
    setAttemptsLeft,
    isGameComplete,
    setIsGameComplete,
    hasWon,
    setHasWon,
    hiddenEmojis,
    setHiddenEmojis,
    guesses,
    setGuesses,
    hints,
    setHints,
    hasUsedRevealThisRound,
    setHasUsedRevealThisRound,
    resetGameState
  };
}