import { createContext, ReactNode, useContext } from 'react';
import { Updater } from 'use-immer';
import { Settings } from 'utils/settings';

export interface SettingsContext extends Settings {
  setSettings: Updater<Settings>;
}

interface SettingsProviderProps extends SettingsContext {
  children: ReactNode;
}

export const SettingsContext = createContext<SettingsContext | null>(null);

export function SettingsProvider({ children, ...values }: SettingsProviderProps) {
  return <SettingsContext.Provider value={{ ...values }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }

  return context;
}
