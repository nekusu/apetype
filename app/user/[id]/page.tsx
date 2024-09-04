import { Button, Text, Transition } from '@/components/core';
import { PersonalBests, UserDetails } from '@/components/profile';
import { setupFirebaseAdmin } from '@/utils/firebase/admin/app';
import { parseTimestamps } from '@/utils/misc';
import { type User, parseDates } from '@/utils/user';
import { type DocumentData, getCollection, getDoc } from '@tatsuokaniwa/swr-firestore/server';
import Link from 'next/link';
import { RiKeyboardBoxFill } from 'react-icons/ri';

setupFirebaseAdmin();

export default async function UserPage({ params }: { params: { id: string } }) {
  const { data: usersWithSameName } = await getCollection<User>({
    path: 'users',
    where: [['name', '==', params.id]],
    parseDates,
  });
  const userByName = usersWithSameName[0];
  let userById: DocumentData<User> | undefined;
  if (!userByName) userById = (await getDoc<User>({ path: `users/${params.id}`, parseDates })).data;
  const { ref, personalBests, ...user } = userByName ?? userById ?? {};

  return ref ? (
    <Transition className='flex w-full flex-col gap-6 self-center'>
      <UserDetails user={user} />
      <PersonalBests data={parseTimestamps(personalBests)} />
    </Transition>
  ) : (
    <Transition className='flex cursor-default flex-col items-center gap-6 self-center'>
      <Text className='font-bold text-9xl leading-none' dimmed>
        404
      </Text>
      <Text className='text-center'>User not found.</Text>
      <Button asChild className='gap-2.5 px-4 py-3' variant='filled'>
        <Link href='/'>
          <RiKeyboardBoxFill />
          Go Home
        </Link>
      </Button>
    </Transition>
  );
}
