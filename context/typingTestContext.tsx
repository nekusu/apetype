'use client';

import { createContext, ReactNode, useContext } from 'react';
import { Updater, useImmer } from 'use-immer';
import { initialValues, Language, TypingTestValues } from 'utils/typingTest';

interface TypingTestContext extends TypingTestValues {
  setValues: Updater<TypingTestValues>;
}

interface TypingTestProviderProps {
  children: ReactNode;
  language?: Language;
}

export const TypingTestContext = createContext<TypingTestContext | null>(null);

export function TypingTestProvider({ children, language }: TypingTestProviderProps) {
  const [values, setValues] = useImmer(initialValues);

  return (
    <TypingTestContext.Provider value={{ setValues, ...values, language }}>
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
