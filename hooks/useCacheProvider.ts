import { compress, decompress } from 'lz-ts';
import { useCallback, useEffect, useRef } from 'react';
import type { State } from 'swr';

type CacheMap = Map<string, State<unknown, unknown>>;

export function useCacheProvider(enabled = true) {
  const _cache = useRef<CacheMap>(new Map());

  const load = useCallback(() => {
    const appCache = localStorage.getItem('app-cache');
    if (appCache) {
      const map = new Map(
        JSON.parse(decompress(appCache)) as Iterable<[string, State<unknown, unknown>]>,
      );
      map.forEach((value, key) => _cache.current.set(key, value));
    } else _cache.current = new Map();
  }, []);
  const save = useCallback((cache = _cache.current) => {
    const appCache = JSON.stringify(Array.from(cache.entries()));
    localStorage.setItem('app-cache', compress(appCache));
  }, []);

  useEffect(() => {
    const _save = () => save();
    if (enabled) {
      load();
      window.addEventListener('beforeunload', _save);
    }
    return () => window.removeEventListener('beforeunload', _save);
  }, [enabled, load, save]);

  return { provider: () => _cache.current, load, save };
}
