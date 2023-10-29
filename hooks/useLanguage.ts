import useSWRImmutable from 'swr/immutable';
import { replaceSpaces } from 'utils/misc';
import { STATIC_URL } from 'utils/monkeytype';
import { Language } from 'utils/typingTest';

export function useLanguage(name: string) {
  const { data, error, isLoading } = useSWRImmutable<Language, Error>(
    `${STATIC_URL}/languages/${replaceSpaces(name)}.json`,
  );

  return { language: data, isLoading, isError: error };
}
