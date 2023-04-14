'use client';

import { createContext, ReactNode, useContext } from 'react';
import { Updater, useImmer } from 'use-immer';
import { initialValues, TypingTestValues } from 'utils/typingTest';

interface TypingTestContext extends TypingTestValues {
  setValues: Updater<TypingTestValues>;
}

export const TypingTestContext = createContext<TypingTestContext | null>(null);

export function TypingTestProvider({ children }: { children: ReactNode }) {
  const [values, setValues] = useImmer(initialValues);

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
