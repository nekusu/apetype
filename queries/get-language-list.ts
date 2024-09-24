import { STATIC_URL } from '@/utils/monkeytype';
import { queryOptions } from '@tanstack/react-query';
import { unstable_cache } from 'next/cache';

export async function getLanguageList() {
  const res = await fetch(`${STATIC_URL}/languages/_list.json`);
  const languages = (await res.json()) as string[];
  return languages.map((name) => name.replaceAll('_', ' '));
}

const queryKey = ['languages'];
export const getCachedLanguageList = unstable_cache(getLanguageList, queryKey, {
  revalidate: 86400,
});
export const languageListOptions = queryOptions({ queryKey, queryFn: getLanguageList });
export const cachedLanguageListOptions = queryOptions({ queryKey, queryFn: getCachedLanguageList });
