import type { TypedSupabaseClient } from '@/utils/supabase/types';
import { queryOptions } from '@tanstack/react-query';

export function getAuthUser(client: TypedSupabaseClient) {
  return queryOptions({
    queryKey: ['auth_user'],
    queryFn: async () => {
      const { data, error } = await client.auth.getUser();
      if (error) throw error;
      return data.user;
    },
    gcTime: 5 * 60 * 1000,
    meta: { disablePersister: true },
  });
}
