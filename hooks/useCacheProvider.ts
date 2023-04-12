/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from 'react';
import { State } from 'swr';
import { useDidMount } from './useDidMount';

export function cacheProvider() {
  const appCache = localStorage.getItem('app-cache') || '[]';
  const map = new Map(JSON.parse(appCache) as Iterable<[string, State<any, any>]>);
  window.addEventListener('beforeunload', () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem('app-cache', appCache);
  });
  return map;
}

export function useCacheProvider() {
  const provider = useRef<typeof cacheProvider>();

  useDidMount(() => {
    provider.current = cacheProvider;
  });

  return provider.current;
}
