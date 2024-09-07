'use client';

import { useCacheProvider } from '@/hooks/useCacheProvider';
import { useDidMount } from '@/hooks/useDidMount';
import fonts from '@/utils/fonts';
import { type Settings, defaultSettings, validateSettings } from '@/utils/settings';
import { useIsomorphicEffect, useLocalStorage } from '@mantine/hooks';
import { freeze, produce } from 'immer';
import { type ReactNode, createContext, useCallback, useContext, useEffect } from 'react';
import { SWRConfig } from 'swr';
import type { Updater } from 'use-immer';
import { picklist } from 'valibot';
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
      const languages = settingsList.language.options.map(({ value }) => value);
      const layouts = settingsList.keymapLayout.options.map(({ value }) => value);
      const themes = settingsList.theme.options.map(({ value }) => value);
      return validateSettings(settings, {
        language: picklist(languages),
        keymapLayout: picklist(layouts),
        theme: picklist(themes),
        ...customProperties,
      });
    },
    [settingsList],
  );

  useDidMount(() => {
    _setSettings((settings) => validate(settings)[0]);
  });
  useEffect(() => {
    setGlobalValues((draft) => {
      draft.settingsList.customTheme.options = settings.customThemes.map(({ id, name }) => ({
        alt: name,
        value: id,
      }));
    });
  }, [setGlobalValues, settings.customThemes]);
  useIsomorphicEffect(() => {
    const font = fonts[settings.fontFamily];
    if (font) {
      document.documentElement.className = font.variable;
      document.documentElement.style.removeProperty('--custom-font');
    } else document.documentElement.style.setProperty('--custom-font', settings.fontFamily);
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
