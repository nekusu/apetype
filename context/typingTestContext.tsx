'use client';

import { type TypingTestValues, initialValues } from '@/utils/typingTest';
import { type ReactNode, createContext, useContext } from 'react';
import { type Updater, useImmer } from 'use-immer';

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
