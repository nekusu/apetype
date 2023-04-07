import { useDidUpdate, useTimeout } from '@mantine/hooks';
import { useCallback, useState } from 'react';
import useSWR from 'swr';
import { replaceSpaces } from 'utils/misc';
import { STATIC_URL } from 'utils/monkeytype';
import { ThemeColors, themeColorVariables } from 'utils/settings';

function extractThemeColors(string: string) {
  const regex = /(?<!\/\*.*)(--.+):\s*(.+);/g;
  const matches: RegExpExecArray[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(string)) !== null) matches.push(match);
  return Object.entries(themeColorVariables).reduce((colors, [key, variable]) => {
    const value = matches.find(([, _variable]) => _variable === variable)?.[2];
    colors[key as keyof ThemeColors] = value ?? '';
    return colors;
  }, {} as ThemeColors);
}

export function useTheme(
  name: string,
  options: { previewDelay: number; enabled?: boolean } = { previewDelay: 0, enabled: true }
) {
  const [themeName, setThemeName] = useState(replaceSpaces(name));
  const { start, clear } = useTimeout((params: string[]) => {
    const [name] = params;
    setThemeName(replaceSpaces(name));
  }, options.previewDelay);
  const {
    data: themeColors,
    error,
    isLoading,
  } = useSWR<ThemeColors, Error>(
    `${STATIC_URL}/themes/${themeName}.css`,
    (url: string) => fetch(url).then(async (res) => extractThemeColors(await res.text())),
    { keepPreviousData: true }
  );

  const previewTheme = useCallback(
    (name: string) => {
      clear();
      start(name);
    },
    [clear, start]
  );
  const clearPreview = useCallback(() => {
    clear();
    setThemeName(replaceSpaces(name));
  }, [clear, name]);

  useDidUpdate(() => {
    setThemeName(replaceSpaces(name));
  }, [name]);

  return { themeColors, isLoading, error, previewTheme, clearPreview };
}
