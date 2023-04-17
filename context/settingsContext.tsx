'use client';

import { useIsomorphicEffect, useLocalStorage } from '@mantine/hooks';
import { useCacheProvider } from 'hooks/useCacheProvider';
import { useDidMount } from 'hooks/useDidMount';
import produce, { freeze } from 'immer';
import { ReactNode, createContext, useCallback, useContext, useEffect } from 'react';
import { SWRConfig } from 'swr';
import { DraftFunction, Updater } from 'use-immer';
import { Settings, defaultSettings, validateSettings } from 'utils/settings';
import { useGlobal } from './globalContext';

export interface SettingsContext extends Settings {
  setSettings: Updater<Settings>;
}

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsContext = createContext<SettingsContext | null>(null);

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { setGlobalValues } = useGlobal();
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
  const provider = useCacheProvider(settings.persistentCache);

  useDidMount(() => {
    _setSettings((settings) => validateSettings(settings)[0]);
  });
  useEffect(() => {
    setGlobalValues(
      (draft) =>
        void (draft.settingsList.customTheme.options = settings.customThemes.map(
          ({ id, name }) => ({ alt: name, value: id })
        ))
    );
  }, [setGlobalValues, settings.customThemes]);
  useIsomorphicEffect(() => {
    const fontFamily = settings.fontFamily;
    document.documentElement.style.setProperty(
      '--font',
      fontFamily.startsWith('--') ? `var(${fontFamily})` : fontFamily
    );
  }, [settings.fontFamily]);

  return (
    <SettingsContext.Provider value={{ setSettings, ...settings }}>
      <SWRConfig
        value={{
          fetcher: (input: RequestInfo | URL, init?: RequestInit) =>
            fetch(input, init).then((res) => res.json()),
          provider,
        }}
      >
        {children}
      </SWRConfig>
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
