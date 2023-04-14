/* eslint-disable @typescript-eslint/no-explicit-any */
import { useWindowEvent } from '@mantine/hooks';
import { compress, decompress } from 'lz-ts';
import { useRef } from 'react';
import { State } from 'swr';
import { useDidMount } from './useDidMount';

export function useCacheProvider() {
  const cache = useRef<Map<string, State<any, any>>>(new Map());

  useDidMount(() => {
    const appCache = localStorage.getItem('app-cache');
    if (appCache) {
      const map = new Map(JSON.parse(decompress(appCache)) as Iterable<[string, State<any, any>]>);
      map.forEach((value, key) => cache.current.set(key, value));
    }
  });
  useWindowEvent('beforeunload', () => {
    const appCache = JSON.stringify(Array.from(cache.current.entries()));
    localStorage.setItem('app-cache', compress(appCache));
  });

  return () => cache.current;
}
