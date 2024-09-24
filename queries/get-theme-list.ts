import { STATIC_URL } from '@/utils/monkeytype';
import type { ThemeInfo } from '@/utils/theme';
import { queryOptions } from '@tanstack/react-query';
import { unstable_cache } from 'next/cache';

export async function getThemeList() {
  const res = await fetch(`${STATIC_URL}/themes/_list.json`);
  const themes = (await res.json()) as ThemeInfo[];
  return themes
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name, ...rest }) => ({ name: name.replaceAll('_', ' '), ...rest }));
}

const queryKey = ['themes'];
export const getCachedThemeList = unstable_cache(getThemeList, queryKey, { revalidate: 86400 });
export const themeListOptions = queryOptions({ queryKey, queryFn: getThemeList });
export const cachedThemeListOptions = queryOptions({ queryKey, queryFn: getCachedThemeList });
