'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo } from 'react';
import { DailyGame, GameState } from '@/types';

type GameAction =
  | { type: 'INITIALIZE'; payload: { gameState?: Partial<GameState>; streak: number; lastPlayedDate: string } }
  | { type: 'UPDATE_SELECTED_EMOJIS'; payload: string[] }
  | { type: 'ADD_HINT'; payload: { emoji: string; guessRound: number } }
  | { type: 'TOGGLE_EMOJI_VISIBILITY'; payload: string }
  | { type: 'SUBMIT_GUESS'; payload: { guess: string[]; isCorrect: boolean; incorrectEmojis: string[]; correctEmojis: string[] } }
  | { type: 'RESET_GAME'; payload: DailyGame }
  | { type: 'UPDATE_STREAK_ON_START' }
  | { type: 'COMPLETE_GAME'; payload: { hasWon: boolean } };

const initialState: GameState = {
  selectedEmojis: [],
  correctEmojis: new Set(),
  incorrectEmojis: new Set(),
  attemptsLeft: 3,
  isGameComplete: false,
  hasWon: false,
  guesses: [],
  hints: {},
  hiddenEmojis: new Set(),
  hasUsedRevealThisRound: false,
  streak: 0,
  lastPlayedDate: '',
  isInitialized: false,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INITIALIZE':
      const { gameState, streak, lastPlayedDate } = action.payload;
      return {
        ...state,
        ...gameState,
        correctEmojis: new Set(gameState?.correctEmojis || []),
        incorrectEmojis: new Set(gameState?.incorrectEmojis || []),
        hints: gameState?.hints || {},
        hiddenEmojis: new Set(gameState?.hiddenEmojis || []),
        streak,
        lastPlayedDate,
        isInitialized: true,
      };

    case 'UPDATE_SELECTED_EMOJIS':
      return { ...state, selectedEmojis: action.payload };

    case 'ADD_HINT':
      return {
        ...state,
        hints: { ...state.hints, [action.payload.emoji]: action.payload.guessRound },
        hasUsedRevealThisRound: true,
      };

    case 'TOGGLE_EMOJI_VISIBILITY':
      const newHidden = new Set(state.hiddenEmojis);
      if (newHidden.has(action.payload)) {
        newHidden.delete(action.payload);
      } else {
        newHidden.add(action.payload);
      }
      return {
        ...state,
        hiddenEmojis: newHidden,
      };

    case 'SUBMIT_GUESS':
      const { guess, isCorrect, incorrectEmojis, correctEmojis } = action.payload;
      const newIncorrect = new Set(state.incorrectEmojis);
      const newCorrectEmojis = new Set(state.correctEmojis);
      
      incorrectEmojis.forEach(emoji => newIncorrect.add(emoji));
      correctEmojis.forEach(emoji => newCorrectEmojis.add(emoji));
      
      return {
        ...state,
        guesses: [...state.guesses, guess],
        correctEmojis: newCorrectEmojis,
        incorrectEmojis: newIncorrect,
        attemptsLeft: isCorrect ? state.attemptsLeft : state.attemptsLeft - 1,
        hasUsedRevealThisRound: false,
      };

    case 'COMPLETE_GAME':
      return {
        ...state,
        isGameComplete: true,
        hasWon: action.payload.hasWon,
        streak: action.payload.hasWon ? state.streak + 1 : 0,
      };

    case 'RESET_GAME':
      return {
        ...state,
        selectedEmojis: new Array(action.payload.required_count).fill(''),
        correctEmojis: new Set(),
        incorrectEmojis: new Set(),
        attemptsLeft: 3,
        isGameComplete: false,
        hasWon: false,
        guesses: [],
        hints: {},
        hiddenEmojis: new Set(),
        hasUsedRevealThisRound: false,
      };

    case 'UPDATE_STREAK_ON_START':
      const today = new Date().toISOString().split('T')[0];
      let newStreak = state.streak;
      
      if (state.lastPlayedDate && state.lastPlayedDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        
        if (state.lastPlayedDate !== yesterdayString) {
          newStreak = 0;
        }
      } else if (!state.lastPlayedDate) {
        newStreak = 0;
      }
      
      return {
        ...state,
        streak: newStreak,
        lastPlayedDate: today,
      };

    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  actions: {
    updateSelectedEmojis: (emojis: string[]) => void;
    addHint: (emoji: string, guessRound: number) => void;
    toggleEmojiVisibility: (emoji: string) => void;
    submitGuess: (guess: string[], isCorrect: boolean, incorrectEmojis: string[], correctEmojis: string[]) => void;
    completeGame: (hasWon: boolean) => void;
    resetGame: (dailyGame: DailyGame) => void;
    updateStreakOnStart: () => void;
  };
}

const GameContext = createContext<GameContextType | null>(null);

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    try {
      const savedGameState = localStorage.getItem('gameState');
      const savedStreak = localStorage.getItem('streak');
      const savedLastPlayed = localStorage.getItem('lastPlayedDate');

      const gameState = savedGameState ? JSON.parse(savedGameState) : {};
      const streak = Number(savedStreak) || 0;
      const lastPlayedDate = savedLastPlayed || '';

      dispatch({
        type: 'INITIALIZE',
        payload: { gameState, streak, lastPlayedDate }
      });
    } catch (error) {
      console.error('Failed to load game state from localStorage:', error);
      dispatch({
        type: 'INITIALIZE',
        payload: { gameState: {}, streak: 0, lastPlayedDate: '' }
      });
    }
  }, []);

  useEffect(() => {
    if (!state.isInitialized) return;

    try {
      const gameStateToSave = {
        selectedEmojis: state.selectedEmojis,
        correctEmojis: Array.from(state.correctEmojis),
        incorrectEmojis: Array.from(state.incorrectEmojis),
        guesses: state.guesses,
        hints: state.hints,
        hiddenEmojis: Array.from(state.hiddenEmojis),
        attemptsLeft: state.attemptsLeft,
        isGameComplete: state.isGameComplete,
        hasWon: state.hasWon,
        hasUsedRevealThisRound: state.hasUsedRevealThisRound,
      };

      localStorage.setItem('gameState', JSON.stringify(gameStateToSave));
      localStorage.setItem('streak', state.streak.toString());
      localStorage.setItem('lastPlayedDate', state.lastPlayedDate);
    } catch (error) {
      console.error('Failed to save game state to localStorage:', error);
    }
  }, [
    state.selectedEmojis,
    state.correctEmojis,
    state.incorrectEmojis,
    state.guesses,
    state.hints,
    state.hiddenEmojis,
    state.attemptsLeft,
    state.isGameComplete,
    state.hasWon,
    state.hasUsedRevealThisRound,
    state.streak,
    state.lastPlayedDate,
    state.isInitialized
  ]);

  const actions = useMemo(() => ({
    updateSelectedEmojis: (emojis: string[]) => {
      dispatch({ type: 'UPDATE_SELECTED_EMOJIS', payload: emojis });
    },
    addHint: (emoji: string, guessRound: number) => {
      dispatch({ type: 'ADD_HINT', payload: { emoji, guessRound } });
    },
    toggleEmojiVisibility: (emoji: string) => {
      dispatch({ type: 'TOGGLE_EMOJI_VISIBILITY', payload: emoji });
    },
    submitGuess: (guess: string[], isCorrect: boolean, incorrectEmojis: string[], correctEmojis: string[]) => {
      dispatch({ type: 'SUBMIT_GUESS', payload: { guess, isCorrect, incorrectEmojis, correctEmojis } });
    },
    completeGame: (hasWon: boolean) => {
      dispatch({ type: 'COMPLETE_GAME', payload: { hasWon } });
    },
    resetGame: (dailyGame: DailyGame) => {
      dispatch({ type: 'RESET_GAME', payload: dailyGame });
    },
    updateStreakOnStart: () => {
      dispatch({ type: 'UPDATE_STREAK_ON_START' });
    },
  }), []);

  const contextValue = useMemo(() => ({
    state,
    actions,
  }), [state, actions]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}