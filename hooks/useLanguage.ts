import { replaceSpaces } from '@/utils/misc';
import { STATIC_URL } from '@/utils/monkeytype';
import type { Language } from '@/utils/typingTest';
import useSWRImmutable from 'swr/immutable';

export function useLanguage(name: string) {
  const { data, error, isLoading } = useSWRImmutable<Language, Error>(
    `${STATIC_URL}/languages/${replaceSpaces(name)}.json`,
  );

  return { language: data, isLoading, isError: error };
}
