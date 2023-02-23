import { createContext, ReactNode, useContext } from 'react';
import { Updater } from 'use-immer';
import { SettingId, ThemeInfo } from 'utils/settings';
import { Language } from 'utils/typingTest';

export interface GlobalValues {
  themes: Record<string, Omit<ThemeInfo, 'name'>>;
  language?: Language;
  testId?: string;
  capsLock: boolean;
  isThemeLoading?: boolean;
  isUserTyping: boolean;
  isTestFinished: boolean;
  modalOpen: boolean;
}

export interface GlobalContext extends GlobalValues {
  setGlobalValues: Updater<GlobalValues>;
  commandLineHandler: {
    open: (settingId?: SettingId) => void;
    close: () => void;
    toggle: () => void;
  };
  restartTest: () => void;
}

interface GlobalProviderProps extends GlobalContext {
  children: ReactNode;
}

export const GlobalContext = createContext<GlobalContext | null>(null);

export function GlobalProvider({ children, ...values }: GlobalProviderProps) {
  return <GlobalContext.Provider value={{ ...values }}>{children}</GlobalContext.Provider>;
}

export function useGlobal() {
  const context = useContext(GlobalContext);

  if (!context) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }

  return context;
}
