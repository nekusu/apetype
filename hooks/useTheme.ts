import { useDidUpdate, useTimeout } from '@mantine/hooks';
import { useCallback, useState } from 'react';
import useSWR from 'swr';
import { replaceSpaces } from 'utils/misc';
import { STATIC_URL } from 'utils/monkeytype';

export interface useThemeOptions {
  previewDelay?: number;
}

let styleElement: HTMLStyleElement | null = null;
if (typeof document !== 'undefined') {
  styleElement = document.createElement('style');
  document.head.appendChild(styleElement);
}

export function useTheme(name: string, { previewDelay = 0 }: useThemeOptions = {}) {
  const [themeName, setThemeName] = useState(replaceSpaces(name));
  const { start, clear } = useTimeout((params: string[]) => {
    const [name] = params;
    setThemeName(replaceSpaces(name));
  }, previewDelay);
  const { data, error, isLoading } = useSWR<string, Error>(
    `${STATIC_URL}/themes/${themeName}.css`,
    (url: string) => fetch(url).then((res) => res.text()),
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

  if (styleElement && data) styleElement.innerHTML = data;

  return { themeStyle: data, isLoading, isError: error, previewTheme, clearPreview };
}
