'use client';

import { useIsomorphicEffect, useLocalStorage } from '@mantine/hooks';
import { useCacheProvider } from 'hooks/useCacheProvider';
import { useDidMount } from 'hooks/useDidMount';
import { freeze, produce } from 'immer';
import { ReactNode, createContext, useCallback, useContext, useEffect } from 'react';
import { SWRConfig } from 'swr';
import { Updater } from 'use-immer';
import { Settings, defaultSettings, validateSettings } from 'utils/settings';
import { z } from 'zod';
import { useGlobal } from './globalContext';

export interface SettingsContext extends Settings {
  setSettings: Updater<Settings>;
  validate: typeof validateSettings;
  cache: ReturnType<typeof useCacheProvider>;
}

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsContext = createContext<SettingsContext | null>(null);

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { settingsList, setGlobalValues } = useGlobal();
  const [settings, _setSettings] = useLocalStorage<Settings>({
    key: 'settings',
    defaultValue: freeze(defaultSettings),
  });
  const cache = useCacheProvider(settings.persistentCache);

  const setSettings: SettingsContext['setSettings'] = useCallback(
    (updater) => {
      if (typeof updater === 'function') _setSettings(produce(updater));
      else _setSettings(freeze(updater));
    },
    [_setSettings],
  );
  const validate: typeof validateSettings = useCallback(
    (settings, customProperties) => {
      type StringTuple = [string, ...string[]];
      const languages = settingsList.language.options.map(({ value }) => value) as StringTuple;
      const layouts = settingsList.keymapLayout.options.map(({ value }) => value) as StringTuple;
      const themes = settingsList.theme.options.map(({ value }) => value) as StringTuple;
      return validateSettings(settings, {
        language: z.enum(languages),
        keymapLayout: z.enum(layouts),
        theme: z.enum(themes),
        ...customProperties,
      });
    },
    [settingsList],
  );

  useDidMount(() => {
    _setSettings((settings) => validate(settings)[0]);
  });
  useEffect(() => {
    setGlobalValues(
      (draft) =>
        void (draft.settingsList.customTheme.options = settings.customThemes.map(
          ({ id, name }) => ({ alt: name, value: id }),
        )),
    );
  }, [setGlobalValues, settings.customThemes]);
  useIsomorphicEffect(() => {
    const fontFamily = settings.fontFamily;
    document.documentElement.style.setProperty(
      '--font',
      fontFamily.startsWith('--') ? `var(${fontFamily})` : fontFamily,
    );
  }, [settings.fontFamily]);

  return (
    <SettingsContext.Provider value={{ setSettings, validate, cache, ...settings }}>
      <SWRConfig
        value={{
          fetcher: (input: RequestInfo, init: RequestInit) =>
            fetch(input, init).then((res) => res.json()),
          keepPreviousData: true,
          revalidateOnFocus: false,
          provider: cache.provider,
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
