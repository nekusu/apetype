import type { TypedSupabaseClient } from '@/utils/supabase/types';
import { infiniteQueryOptions } from '@tanstack/react-query';

interface Filters {
  orderBy?: string;
  desc?: boolean;
  page?: number;
  pageSize?: number;
}

export function getTestsByUserId(
  client: TypedSupabaseClient,
  userId = '',
  { orderBy = 'createdAt', desc = true, page = 0, pageSize = 10 }: Filters = {},
) {
  return client
    .from('tests')
    .select(
      'id,createdAt,mode,mode2,language,raw,wpm,accuracy,consistency,charStats,chartData,duration,blindMode,lazyMode,isPb',
    )
    .eq('userId', userId)
    .order(orderBy, { ascending: !desc })
    .range(page * pageSize, (page + 1) * pageSize - 1)
    .throwOnError();
}

export function testsByUserIdOptions(
  client: TypedSupabaseClient,
  id = '',
  { orderBy = 'createdAt', desc = true, pageSize = 10 }: Filters = {},
) {
  return infiniteQueryOptions({
    enabled: !!id,
    queryKey: ['tests', { id, orderBy, desc }],
    queryFn: async ({ pageParam }) =>
      await getTestsByUserId(client, id, { orderBy, desc, page: pageParam, pageSize }),
    initialPageParam: 0,
    getNextPageParam: ({ data }, _, lastPageParam) =>
      data && data.length >= 10 ? lastPageParam + 1 : undefined,
    meta: { disablePersister: true },
  });
}
