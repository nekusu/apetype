import { getPersonalBestsByUserId } from '@/queries/get-pb-by-user-id';
import { testsByUserIdOptions } from '@/queries/get-tests-by-user-id';
import { getUserStatsById } from '@/queries/get-user-stats-by-id';
import { createClient } from '@/utils/supabase/server';
import { prefetchQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user)
    await Promise.all([
      prefetchQuery(queryClient, getUserStatsById(supabase, user.id)),
      prefetchQuery(queryClient, getPersonalBestsByUserId(supabase, user.id)),
      queryClient.prefetchInfiniteQuery(testsByUserIdOptions(supabase, user.id)),
    ]);
  else notFound();

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
