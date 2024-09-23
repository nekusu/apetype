import type { TypedSupabaseClient } from '@/utils/supabase/types';
import { encode } from '@supabase-cache-helpers/postgrest-react-query';
import { queryOptions } from '@tanstack/react-query';
import { unstable_cache } from 'next/cache';

export function getPersonalBestsByUserId(client: TypedSupabaseClient, userId = '') {
  return client
    .from('personal_bests')
    .select('testId,mode,mode2,language,lazyMode,wpm,...tests(createdAt,raw,accuracy,consistency)')
    .eq('userId', userId)
    .throwOnError();
}

export function getCachedPBsByUserId(client: TypedSupabaseClient, id = '') {
  return unstable_cache(
    async (id) => await getPersonalBestsByUserId(client, id),
    ['personal_bests', id],
    { tags: [`personal_bests:${id}`], revalidate: 86400 },
  )(id);
}

export const pbsByUserIdQueryKey = (client: TypedSupabaseClient, id = '') =>
  encode(getPersonalBestsByUserId(client, id), false);

export function pbsByUserIdOptions(client: TypedSupabaseClient, id = '', cached?: boolean) {
  return queryOptions({
    enabled: !!id,
    queryKey: pbsByUserIdQueryKey(client),
    queryFn: async () =>
      await (cached ? getCachedPBsByUserId(client, id) : getPersonalBestsByUserId(client, id)),
    meta: { disablePersister: true },
  });
}
