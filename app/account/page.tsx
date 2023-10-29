'use client';

import { useDisclosure } from '@mantine/hooks';
import Loading from 'app/loading';
import { Button, Tooltip, Transition } from 'components/core';
import {
  PersonalBests,
  ProfileEditModal,
  TestHistory,
  UserDetails,
  UserStats,
} from 'components/profile';
import { useAuth } from 'context/authContext';
import { useUser } from 'context/userContext';
import { useDidMount } from 'hooks/useDidMount';
import { redirect } from 'next/navigation';
import toast from 'react-hot-toast';
import { RiLinksLine } from 'react-icons/ri';

export default function Account() {
  const { signedIn } = useAuth();
  const { user, savePendingData } = useUser();
  const { completedTests = 0 } = user?.typingStats ?? {};
  const [profileEditModalOpen, profileEditModalHandler] = useDisclosure(false);

  const copyProfileURL = () => {
    void navigator.clipboard
      .writeText(`${window.location.origin}/user/${user?.name}`)
      .then(() => toast.success('URL copied to clipboard!'));
  };

  useDidMount(() => {
    void savePendingData();
  });

  if (!signedIn) redirect('/');

  return user ? (
    <Transition className='w-full flex flex-col self-center gap-6'>
      <UserDetails
        user={user}
        actions={
          <div className='flex gap-2'>
            <Tooltip className='bg-bg' label='Copy profile URL'>
              <Button className='bg-bg px-2.5' variant='filled' onClick={copyProfileURL}>
                <RiLinksLine />
              </Button>
            </Tooltip>
            <Button className='px-3' active variant='filled' onClick={profileEditModalHandler.open}>
              edit profile
            </Button>
          </div>
        }
        editable
      />
      <ProfileEditModal open={profileEditModalOpen} onClose={profileEditModalHandler.close} />
      <PersonalBests data={user.personalBests} />
      {completedTests > 1 && <UserStats userId={user.id} {...user.typingStats} />}
      {completedTests > 0 && <TestHistory />}
    </Transition>
  ) : (
    <Loading />
  );
}
