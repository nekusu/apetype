/* eslint-disable @typescript-eslint/no-explicit-any */
import { compress, decompress } from 'lz-ts';
import { useEffect, useRef } from 'react';
import { State } from 'swr';

export function useCacheProvider(enabled = true) {
  const cache = useRef<Map<string, State<any, any>>>(new Map());

  useEffect(() => {
    const appCache = localStorage.getItem('app-cache');
    if (appCache) {
      const map = new Map(JSON.parse(decompress(appCache)) as Iterable<[string, State<any, any>]>);
      map.forEach((value, key) => cache.current.set(key, value));
    }
    const saveCache = () => {
      const appCache = JSON.stringify(Array.from(cache.current.entries()));
      localStorage.setItem('app-cache', compress(appCache));
    };
    if (enabled) window.addEventListener('beforeunload', saveCache);
    return () => window.removeEventListener('beforeunload', saveCache);
  }, [enabled]);

  return () => cache.current;
}
