import { createContext, ReactNode, useContext } from 'react';
import { Updater } from 'use-immer';
import { Settings } from 'utils/settings';

interface SettingContext extends Settings {
  setSettings: Updater<Settings>;
}

interface SettingsProviderProps extends SettingContext {
  children: ReactNode;
}

export const SettingsContext = createContext<SettingContext | null>(null);

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
