import type { TypedSupabaseClient } from '@/utils/supabase/types';
import { queryOptions } from '@tanstack/react-query';

export function getUserIdentities(client: TypedSupabaseClient) {
  return queryOptions({
    queryKey: ['user_identities'],
    queryFn: async () => {
      const { data, error } = await client.auth.getUserIdentities();
      if (error) throw error;
      return data.identities;
    },
    gcTime: 5 * 60 * 1000,
    meta: { disablePersister: true },
  });
}
