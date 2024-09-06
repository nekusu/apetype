'use client';

import type { Word } from '@/utils/typingTest';
import { type ReactNode, createContext, useContext } from 'react';
import { type Updater, useImmer } from 'use-immer';

export interface TypingTestValues {
  words: Word[];
  wordIndex: number;
  inputValue: string;
  lastCharacter: string;
  currentStats: {
    raw: number;
    wpm: number;
    characters: number;
    errors: number;
  };
  stats: {
    raw: number[];
    wpm: number[];
    characters: number[];
    errors: number[];
  };
  timer: number;
  startTime: number;
  elapsedTime: number;
  isTestRunning: boolean;
}

interface TypingTestContext extends TypingTestValues {
  setValues: Updater<TypingTestValues>;
}

export const TypingTestContext = createContext<TypingTestContext | null>(null);

export const initialTypingTestValues: TypingTestValues = {
  words: [],
  wordIndex: 0,
  inputValue: ' ',
  lastCharacter: ' ',
  currentStats: {
    raw: 0,
    wpm: 0,
    characters: 0,
    errors: 0,
  },
  stats: {
    raw: [],
    wpm: [],
    characters: [],
    errors: [],
  },
  timer: 0,
  startTime: 0,
  elapsedTime: 0,
  isTestRunning: false,
};

export function TypingTestProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useImmer(initialTypingTestValues);

  return (
    <TypingTestContext.Provider value={{ setValues, ...values }}>
      {children}
    </TypingTestContext.Provider>
  );
}

export function useTypingTest() {
  const context = useContext(TypingTestContext);

  if (!context) {
    throw new Error('useTypingTest must be used within a TypingTestProvider');
  }

  return context;
}
