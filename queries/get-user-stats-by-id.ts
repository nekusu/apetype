import type { TypedSupabaseClient } from '@/utils/supabase/types';
import { encode } from '@supabase-cache-helpers/postgrest-react-query';
import { queryOptions } from '@tanstack/react-query';
import { unstable_cache } from 'next/cache';

export function getUserStatsById(client: TypedSupabaseClient, userId = '') {
  return client
    .from('user_stats')
    .select(
      'userId,startedTests,completedTests,timeTyping,avgWpm,avgRaw,avgAccuracy,avgConsistency,highestWpm,highestRaw,highestAccuracy,highestConsistency',
    )
    .eq('userId', userId)
    .throwOnError()
    .maybeSingle();
}

export function getCachedUserStatsById(client: TypedSupabaseClient, id = '') {
  return unstable_cache(async (id) => await getUserStatsById(client, id), ['user_stats', id], {
    tags: [`user_stats:${id}`],
    revalidate: 10800,
  })(id);
}

export const userStatsByIdQueryKey = (client: TypedSupabaseClient, id = '') =>
  encode(getUserStatsById(client, id), false);

export function userStatsByIdOptions(client: TypedSupabaseClient, id = '', cached?: boolean) {
  return queryOptions({
    enabled: !!id,
    queryKey: userStatsByIdQueryKey(client),
    queryFn: async () =>
      await (cached ? getCachedUserStatsById(client, id) : getUserStatsById(client, id)),
    meta: { disablePersister: true },
  });
}
