import useSWR from 'swr';
import { Language } from 'utils/typingTest';

export function useLanguage(name: string) {
  name = name.replaceAll(' ', '_');
  const { data, error, isLoading } = useSWR<Language, Error>(
    `https://raw.githubusercontent.com/monkeytypegame/monkeytype/master/frontend/static/languages/${name}.json`,
    (url: string) => fetch(url).then((res) => res.json())
  );

  return { language: data, isLoading, isError: error };
}

export function useLanguages() {
  const { data, error, isLoading } = useSWR<string[], Error>(
    'https://raw.githubusercontent.com/monkeytypegame/monkeytype/master/frontend/static/languages/_list.json',
    (url: string) => fetch(url).then((res) => res.json())
  );

  return { languages: data, isLoading, isError: error };
}
