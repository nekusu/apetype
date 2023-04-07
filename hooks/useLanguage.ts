import useSWR from 'swr';
import { replaceSpaces } from 'utils/misc';
import { STATIC_URL } from 'utils/monkeytype';
import { Language } from 'utils/typingTest';

export function useLanguage(name: string) {
  const { data, error, isLoading } = useSWR<Language, Error>(
    `${STATIC_URL}/languages/${replaceSpaces(name)}.json`,
    (url: string) => fetch(url).then((res) => res.json()),
    { keepPreviousData: true }
  );

  return { language: data, isLoading, isError: error };
}
