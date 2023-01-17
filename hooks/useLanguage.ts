import useSWR from 'swr';
import { Language } from 'utils/typingTest';

export function useLanguage(name: string) {
  const { data, error, isLoading } = useSWR<Language, Error>(
    `https://raw.githubusercontent.com/monkeytypegame/monkeytype/7c34fa25916e89c2ea84e85e1b1fd162a3108e6e/frontend/static/languages/${name}.json`,
    (url: string) => fetch(url).then((res) => res.json())
  );

  return { language: data, isLoading, isError: error };
}
