import { STATIC_URL } from '@/utils/monkeytype';
import type { KeymapLayout } from '@/utils/typingTest';
import { queryOptions } from '@tanstack/react-query';
import { unstable_cache } from 'next/cache';

export async function getLayoutList() {
  const res = await fetch(`${STATIC_URL}/layouts/_list.json`);
  const layouts = (await res.json()) as Record<string, KeymapLayout>;
  return layouts;
}

const queryKey = ['layouts'];
export const getCachedLayoutList = unstable_cache(getLayoutList, queryKey, { revalidate: 86400 });
export const layoutListOptions = queryOptions({ queryKey, queryFn: getLayoutList });
export const cachedLayoutListOptions = queryOptions({ queryKey, queryFn: getCachedLayoutList });
