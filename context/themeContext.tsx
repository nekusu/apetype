'use client';

import { useDidUpdate, useIsomorphicEffect, useTimeout } from '@mantine/hooks';
import { useDidMount } from 'hooks/useDidMount';
import { useSearchParams } from 'next/navigation';
import { ReactNode, createContext, useCallback, useContext, useState } from 'react';
import useSWR from 'swr';
import tinycolor from 'tinycolor2';
import { Updater, useImmer } from 'use-immer';
import { getRandomNumber, replaceSpaces } from 'utils/misc';
import { STATIC_URL } from 'utils/monkeytype';
import {
  CustomTheme,
  ThemeColors,
  ThemeInfo,
  extractThemeColors,
  removeThemeColors,
  setThemeColors,
} from 'utils/theme';
import { useGlobal } from './globalContext';
import { useSettings } from './settingsContext';

export interface ThemeValues {
  themes: Record<string, Partial<ThemeColors>>;
  colors?: ThemeColors;
  isLoading?: boolean;
}

export interface ThemeContext extends ThemeValues {
  setThemeValues: Updater<ThemeValues>;
  previewTheme: (id: string) => void;
  clearPreview: () => void;
}

interface ThemeProviderProps {
  children: ReactNode;
  previewDelay: number;
  themes: ThemeInfo[];
}

export const ThemeContext = createContext<ThemeContext | null>(null);

export function ThemeProvider({ children, previewDelay, themes }: ThemeProviderProps) {
  const { testId } = useGlobal();
  const {
    randomizeTheme,
    themeType,
    theme,
    customThemes,
    customTheme: customThemeId,
    setSettings,
  } = useSettings();
  const [themeValues, setThemeValues] = useImmer<ThemeValues>({
    themes: themes.reduce((themes, { name, bgColor, mainColor, subColor, textColor }) => {
      themes[name] = { bg: bgColor, main: mainColor, sub: subColor, text: textColor };
      return themes;
    }, {} as ThemeContext['themes']),
  });
  const [themeName, setThemeName] = useState(replaceSpaces(theme));
  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null);
  const { start, clear } = useTimeout((params: string[]) => {
    const [name] = params;
    setThemeName(replaceSpaces(name));
  }, previewDelay);
  const { data: colors, isLoading } = useSWR<ThemeColors, Error>(
    `${STATIC_URL}/themes/${themeName}.css`,
    (url: string) => fetch(url).then(async (res) => extractThemeColors(await res.text())),
    { keepPreviousData: true }
  );
  const searchParams = useSearchParams();
  const previewTheme = useCallback(
    (id?: string) => {
      if (!id) return;
      if (themeType === 'preset') {
        clear();
        start(id);
      } else setPreviewThemeId(id);
    },
    [clear, start, themeType]
  );
  const clearPreview = useCallback(() => {
    clear();
    setThemeName(replaceSpaces(theme));
    setPreviewThemeId(null);
  }, [clear, theme]);

  useDidMount(() => {
    const encodedCustomTheme = searchParams?.get('customTheme');
    if (encodedCustomTheme) {
      const customTheme = JSON.parse(
        Buffer.from(encodedCustomTheme, 'base64').toString()
      ) as CustomTheme;
      if (!customThemes.find(({ id }) => id === customTheme.id))
        setSettings((draft) => {
          draft.themeType = 'custom';
          draft.customThemes.push(customTheme);
          draft.customThemes.sort((a, b) => a.name.localeCompare(b.name));
          draft.customTheme = customTheme.id;
        });
    }
  });
  useDidUpdate(() => {
    setThemeName(replaceSpaces(theme));
  }, [theme]);
  useIsomorphicEffect(() => {
    if (colors) setThemeColors(colors, document.documentElement);
  }, [colors]);
  useIsomorphicEffect(() => {
    const customTheme = customThemes.find(({ id }) => id === (previewThemeId ?? customThemeId));
    if (themeType === 'custom' && customTheme) setThemeColors(customTheme.colors);
    else removeThemeColors();
  }, [customThemeId, customThemes, previewThemeId, themeType]);
  useIsomorphicEffect(() => {
    if (randomizeTheme) {
      if (themeType === 'preset') {
        const themeList = themes.filter(
          ({ name, bgColor }) =>
            name !== theme &&
            (randomizeTheme === true ||
              (randomizeTheme === 'light' && tinycolor(bgColor).isLight()) ||
              (randomizeTheme === 'dark' && tinycolor(bgColor).isDark()))
        );
        const randomTheme = themeList[getRandomNumber(themeList.length - 1)];
        setSettings((draft) => void (randomTheme && (draft.theme = randomTheme.name)));
      } else {
        const themeList = customThemes.filter(
          ({ id, colors: { bg } }) =>
            id !== customThemeId &&
            (randomizeTheme === true ||
              (randomizeTheme === 'light' && tinycolor(bg).isLight()) ||
              (randomizeTheme === 'dark' && tinycolor(bg).isDark()))
        );
        const randomTheme = themeList[getRandomNumber(themeList.length - 1)];
        setSettings((draft) => void (randomTheme && (draft.customTheme = randomTheme.id)));
      }
    }
  }, [testId]);

  return (
    <ThemeContext.Provider
      value={{ setThemeValues, colors, isLoading, previewTheme, clearPreview, ...themeValues }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
