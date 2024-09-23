import { replaceSpaces } from '@/utils/misc';
import { STATIC_URL } from '@/utils/monkeytype';
import type { Language } from '@/utils/typingTest';
import { queryOptions } from '@tanstack/react-query';

export async function getLanguage(name: string) {
  const res = await fetch(`${STATIC_URL}/languages/${replaceSpaces(name)}.json`);
  const language = (await res.json()) as Language;
  return language;
}

export const languageOptions = (name: string) =>
  queryOptions({
    queryKey: ['language', name],
    queryFn: ({ queryKey: [, name] }) => getLanguage(name),
    gcTime: 24 * 60 * 60 * 1000,
    placeholderData: undefined,
  });
