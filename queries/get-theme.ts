import { STATIC_URL } from '@/utils/monkeytype';
import { extractThemeColors } from '@/utils/theme';
import { queryOptions } from '@tanstack/react-query';
import { unstable_cache } from 'next/cache';

export async function getTheme(name: string) {
  const res = await fetch(`${STATIC_URL}/themes/${name}.css`);
  const theme = extractThemeColors(await res.text());
  return theme;
}

export const themeOptions = (name: string) =>
  queryOptions({
    queryKey: ['theme', name],
    queryFn: ({ queryKey: [, name] }) => getTheme(name),
    gcTime: 24 * 60 * 60 * 1000,
    placeholderData: undefined,
  });

export function cachedThemeOptions(name: string) {
  const queryKey = ['theme', name];
  const getCachedTheme = unstable_cache(getTheme, queryKey, {
    revalidate: Number.POSITIVE_INFINITY,
  });
  return queryOptions({
    queryKey,
    queryFn: ({ queryKey: [, name] }) => getCachedTheme(name),
    placeholderData: undefined,
  });
}
