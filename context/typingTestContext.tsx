import { createContext, ReactNode, useContext } from 'react';
import { Updater } from 'use-immer';
import { TypingTestValues } from 'utils/typingTest';

interface TypingTestContext extends TypingTestValues {
  setValues: Updater<TypingTestValues>;
}

interface TypingTestProviderProps extends TypingTestContext {
  children: ReactNode;
}

export const TypingTestContext = createContext<TypingTestContext | null>(null);

export function TypingTestProvider({ children, ...values }: TypingTestProviderProps) {
  return <TypingTestContext.Provider value={{ ...values }}>{children}</TypingTestContext.Provider>;
}

export function useTypingTest() {
  const context = useContext(TypingTestContext);

  if (!context) {
    throw new Error('useTypingTest must be used within a TypingTestProvider');
  }

  return context;
}
