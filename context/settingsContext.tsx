'use client';

import { useIsomorphicEffect, useLocalStorage } from '@mantine/hooks';
import { useDidMount } from 'hooks/useDidMount';
import produce, { freeze } from 'immer';
import { ReactNode, createContext, useCallback, useContext } from 'react';
import tinycolor from 'tinycolor2';
import { DraftFunction, Updater } from 'use-immer';
import { getRandomNumber } from 'utils/misc';
import { Settings, defaultSettings } from 'utils/settings';
import { ThemeInfo } from 'utils/theme';
import { useGlobal } from './globalContext';

export interface SettingsContext extends Settings {
  setSettings: Updater<Settings>;
}

interface SettingsProviderProps {
  children: ReactNode;
  themes: ThemeInfo[];
}

export const SettingsContext = createContext<SettingsContext | null>(null);

export function SettingsProvider({ children, themes }: SettingsProviderProps) {
  const { testId } = useGlobal();
  const [settings, _setSettings] = useLocalStorage<Settings>({
    key: 'settings',
    defaultValue: freeze(defaultSettings),
  });
  const setSettings: SettingsContext['setSettings'] = useCallback(
    (updater: Settings | DraftFunction<Settings>) => {
      if (typeof updater === 'function') _setSettings(produce(updater));
      else _setSettings(freeze(updater));
    },
    [_setSettings]
  );

  useDidMount(() => {
    _setSettings((currentSettings) => ({ ...defaultSettings, ...currentSettings }));
  });
  useIsomorphicEffect(() => {
    const fontFamily = settings.fontFamily;
    document.documentElement.style.setProperty(
      '--font',
      fontFamily.startsWith('--') ? `var(${fontFamily})` : fontFamily
    );
  }, [settings.fontFamily]);
  useIsomorphicEffect(() => {
    if (settings.randomizeTheme) {
      let theme: ThemeInfo | undefined;
      do theme = themes[getRandomNumber(themes.length)];
      while (
        !theme ||
        (settings.randomizeTheme === 'light' && tinycolor(theme.bgColor).isDark()) ||
        (settings.randomizeTheme === 'dark' && tinycolor(theme.bgColor).isLight()) ||
        theme.name === settings.theme
      );
      setSettings((draft) => {
        if (theme) draft.theme = theme.name;
      });
    }
  }, [testId]);

  return (
    <SettingsContext.Provider value={{ setSettings, ...settings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }

  return context;
}
