import { DocumentData, getCollection, getDoc } from '@tatsuokaniwa/swr-firestore/server';
import { Button, Text, Transition } from 'components/core';
import { PersonalBests, UserDetails } from 'components/profile';
import Link from 'next/link';
import { RiKeyboardBoxFill } from 'react-icons/ri';
import { setupFirebaseAdmin } from 'utils/firebase/admin/app';
import { parseTimestamps } from 'utils/misc';
import { User, parseDates } from 'utils/user';

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
    <Transition className='w-full flex flex-col self-center gap-6'>
      <UserDetails user={user} />
      <PersonalBests data={parseTimestamps(personalBests)} />
    </Transition>
  ) : (
    <Transition className='flex flex-col cursor-default items-center self-center gap-6'>
      <Text className='text-[120px] font-bold leading-none' dimmed>
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
