'use client';

import { useDidMount } from '@/hooks/useDidMount';
import { languageListOptions } from '@/queries/get-language-list';
import { layoutListOptions } from '@/queries/get-layout-list';
import { themeListOptions } from '@/queries/get-theme-list';
import fonts from '@/utils/fonts';
import {
  type Settings,
  type SettingsReference,
  defaultSettings,
  settingsReference as reference,
  validateSettings,
} from '@/utils/settings';
import { useIsomorphicEffect, useLocalStorage, useSetState } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { type ReactNode, createContext, useCallback, useContext, useEffect } from 'react';
import { picklist } from 'valibot';

export interface SettingsContext extends Settings {
  settingsReference: SettingsReference;
  setSettings: (
    statePartial: Partial<Settings> | ((currentState: Settings) => Partial<Settings>),
  ) => void;
  validate: typeof validateSettings;
}

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsContext = createContext<SettingsContext | null>(null);

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { data: languages = [] } = useQuery(languageListOptions);
  const { data: layouts = {} } = useQuery(layoutListOptions);
  const { data: themes = [] } = useQuery(themeListOptions);
  const [settingsReference, setSettingsReference] = useSetState<SettingsReference>({
    ...reference,
    language: {
      ...reference.language,
      options: languages.map((language) => ({ value: language })),
    },
    keymapLayout: {
      ...reference.keymapLayout,
      options: Object.keys(layouts).map((layout) => ({ value: layout.replaceAll('_', ' ') })),
    },
    theme: {
      ...reference.theme,
      options: themes.map(({ name }) => ({ value: name })),
    },
  });
  const [settings, _setSettings] = useLocalStorage<Settings>({
    key: 'settings',
    defaultValue: defaultSettings,
  });

  const setSettings = useCallback(
    (statePartial: Partial<Settings> | ((currentState: Settings) => Partial<Settings>)) =>
      _setSettings((current) => ({
        ...current,
        ...(typeof statePartial === 'function' ? statePartial(current) : statePartial),
      })),
    [_setSettings],
  );
  const validate: typeof validateSettings = useCallback(
    (settings, customProperties) => {
      const languages = settingsReference.language.options.map(({ value }) => value);
      const layouts = settingsReference.keymapLayout.options.map(({ value }) => value);
      const themes = settingsReference.theme.options.map(({ value }) => value);
      return validateSettings(settings, {
        language: picklist(languages),
        keymapLayout: picklist(layouts),
        theme: picklist(themes),
        ...customProperties,
      });
    },
    [settingsReference],
  );

  useDidMount(() => {
    _setSettings((settings) => validate(settings)[0]);
  });
  useEffect(() => {
    setSettingsReference((reference) => ({
      customTheme: {
        ...reference.customTheme,
        options: settings.customThemes.map(({ id, name }) => ({ value: id, alt: name })),
      },
    }));
  }, [setSettingsReference, settings.customThemes]);
  useIsomorphicEffect(() => {
    const font = fonts[settings.fontFamily];
    if (font) {
      document.documentElement.className = font.variable;
      document.documentElement.style.removeProperty('--custom-font');
    } else document.documentElement.style.setProperty('--custom-font', settings.fontFamily);
  }, [settings.fontFamily]);

  return (
    <SettingsContext.Provider value={{ settingsReference, setSettings, validate, ...settings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
}
