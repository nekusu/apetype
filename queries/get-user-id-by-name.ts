import type { TypedSupabaseClient } from '@/utils/supabase/types';
import { unstable_cache } from 'next/cache';

export function getUserIdByName(client: TypedSupabaseClient, name: string) {
  return client.from('users').select('id').eq('name', name).throwOnError().maybeSingle();
}

export function getCachedUserIdByName(client: TypedSupabaseClient, name = '') {
  return unstable_cache(async (name) => await getUserIdByName(client, name), ['user_id', name], {
    tags: [`user_id:${name}`],
    revalidate: 86400,
  })(name);
}
