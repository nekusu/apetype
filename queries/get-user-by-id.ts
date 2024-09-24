import type { TypedSupabaseClient } from '@/utils/supabase/types';
import { encode } from '@supabase-cache-helpers/postgrest-react-query';
import { queryOptions } from '@tanstack/react-query';
import { unstable_cache } from 'next/cache';

export function getUserById(client: TypedSupabaseClient, id = '') {
  return client
    .from('users')
    .select(
      'id,joinedAt,avatarURL,avatarShape,bannerURL,name,nameLastChangedAt,bio,keyboard,socials',
    )
    .eq('id', id)
    .throwOnError()
    .maybeSingle();
}

export function getCachedUserById(client: TypedSupabaseClient, id = '') {
  return unstable_cache(async (id) => await getUserById(client, id), ['users', id], {
    tags: [`users:${id}`],
    revalidate: 43200,
  })(id);
}

export const userByIdQueryKey = (client: TypedSupabaseClient, id = '') =>
  encode(getUserById(client, id), false);

export function userByIdOptions(client: TypedSupabaseClient, id = '', cached?: boolean) {
  return queryOptions({
    enabled: !!id,
    queryKey: userByIdQueryKey(client),
    queryFn: async () => await (cached ? getCachedUserById(client, id) : getUserById(client, id)),
    meta: { disablePersister: true },
  });
}
