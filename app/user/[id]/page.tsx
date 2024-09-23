import { Transition } from '@/components/core/Transition';
import { PersonalBests } from '@/components/profile/PersonalBests';
import { UserDetails } from '@/components/profile/UserDetails';
import { pbsByUserIdOptions } from '@/queries/get-pb-by-user-id';
import { userByIdOptions } from '@/queries/get-user-by-id';
import { getCachedUserIdByName } from '@/queries/get-user-id-by-name';
import { userStatsByIdOptions } from '@/queries/get-user-stats-by-id';
import { createClient } from '@/utils/supabase/client';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { is, pipe, string, uuid } from 'valibot';

const isUUID = (id: string) => is(pipe(string(), uuid()), id);

export default async function UserPage({ params: { id } }: { params: { id: string } }) {
  if (!id) notFound();

  const queryClient = new QueryClient();
  const supabase = createClient();
  let userId = id;
  if (!isUUID(userId)) {
    const { data: user } = await getCachedUserIdByName(supabase, userId);
    if (user) userId = user.id;
    else notFound();
  }
  const [{ data: user }, { data: userStats }] = await Promise.all([
    queryClient.fetchQuery(userByIdOptions(supabase, userId, true)),
    queryClient.fetchQuery(userStatsByIdOptions(supabase, userId, true)),
    queryClient.prefetchQuery(pbsByUserIdOptions(supabase, userId, true)),
  ]);

  if (!user) notFound();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Transition className='flex w-full flex-col gap-6 self-center'>
        <UserDetails
          user={user}
          startedTests={userStats?.startedTests}
          completedTests={userStats?.completedTests}
          timeTyping={userStats?.timeTyping}
        />
        <PersonalBests userId={userId} />
      </Transition>
    </HydrationBoundary>
  );
}
