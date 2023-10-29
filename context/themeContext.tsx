'use client';

import { useDidUpdate, useIsomorphicEffect, useTimeout } from '@mantine/hooks';
import { colord } from 'colord';
import { useDidMount } from 'hooks/useDidMount';
import { ReactNode, createContext, useCallback, useContext, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { RiAlertFill } from 'react-icons/ri';
import useSWRImmutable from 'swr/immutable';
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
  themes: Record<string, Pick<ThemeColors, 'bg' | 'main' | 'sub' | 'text'>>;
  colors: {
    preset?: ThemeColors;
    custom?: ThemeColors;
  };
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
    themes: themes.reduce(
      (themes, { name, bgColor, mainColor, subColor, textColor }) => {
        themes[name] = { bg: bgColor, main: mainColor, sub: subColor, text: textColor };
        return themes;
      },
      {} as ThemeContext['themes'],
    ),
    colors: {},
  });
  const [presetName, setPresetName] = useState(replaceSpaces(theme));
  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null);
  const { start, clear } = useTimeout((params: string[]) => {
    const [name] = params;
    setPresetName(replaceSpaces(name));
  }, previewDelay);
  const { data: presetColors, isLoading } = useSWRImmutable<ThemeColors, Error>(
    `${STATIC_URL}/themes/${presetName}.css`,
    (url: string) => fetch(url).then(async (res) => extractThemeColors(await res.text())),
  );
  const customTheme = useMemo(
    () => customThemes.find(({ id }) => id === (previewThemeId ?? customThemeId)),
    [customThemeId, customThemes, previewThemeId],
  );
  const previewTheme = useCallback(
    (id?: string) => {
      if (!id) return;
      if (themeType === 'preset') {
        clear();
        start(id);
      } else setPreviewThemeId(id);
    },
    [clear, start, themeType],
  );
  const clearPreview = useCallback(() => {
    clear();
    setPresetName(replaceSpaces(theme));
    setPreviewThemeId(null);
  }, [clear, theme]);

  useDidMount(() => {
    const params = new URLSearchParams(document.location.search);
    const encodedCustomTheme = params.get('customTheme');
    if (encodedCustomTheme) {
      const toastId = toast.loading('Loading custom theme...');
      const customTheme = JSON.parse(
        Buffer.from(encodedCustomTheme, 'base64').toString(),
      ) as CustomTheme;

      window.history.replaceState('', '', '/');
      setTimeout(() => {
        setSettings((draft) => {
          if (!draft.customThemes.find(({ id }) => id === customTheme.id)) {
            draft.themeType = 'custom';
            draft.customThemes.push(customTheme);
            draft.customThemes.sort((a, b) => a.name.localeCompare(b.name));
            draft.customTheme = customTheme.id;
            toast.success(`Added '${customTheme.name}' custom theme successfully!`, {
              id: toastId,
            });
          } else
            toast(`Custom theme '${customTheme.name}' already exists!`, {
              id: toastId,
              icon: <RiAlertFill />,
            });
        });
      }, 500);
    }
  });
  useDidUpdate(() => {
    setPresetName(replaceSpaces(theme));
  }, [theme]);
  useIsomorphicEffect(() => {
    if (presetColors) setThemeColors(presetColors, document.documentElement);
  }, [presetColors]);
  useIsomorphicEffect(() => {
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
              (randomizeTheme === 'light' && colord(bgColor).isLight()) ||
              (randomizeTheme === 'dark' && colord(bgColor).isDark())),
        );
        const randomTheme = themeList[getRandomNumber(themeList.length - 1)];
        setSettings((draft) => void (randomTheme && (draft.theme = randomTheme.name)));
      } else {
        const themeList = customThemes.filter(
          ({ id, colors: { bg } }) =>
            id !== customThemeId &&
            (randomizeTheme === true ||
              (randomizeTheme === 'light' && colord(bg).isLight()) ||
              (randomizeTheme === 'dark' && colord(bg).isDark())),
        );
        const randomTheme = themeList[getRandomNumber(themeList.length - 1)];
        setSettings((draft) => void (randomTheme && (draft.customTheme = randomTheme.id)));
      }
    }
  }, [testId]);

  return (
    <ThemeContext.Provider
      value={{
        ...themeValues,
        setThemeValues,
        isLoading,
        previewTheme,
        clearPreview,
        colors: { preset: presetColors, custom: customTheme?.colors },
      }}
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
