'use client';

import Loading from '@/app/loading';
import { Button, Group, Tooltip, Transition } from '@/components/core';
import {
  PersonalBests,
  ProfileEditModal,
  TestHistory,
  UserDetails,
  UserStats,
} from '@/components/profile';
import { useAuth } from '@/context/authContext';
import { useUser } from '@/context/userContext';
import { useDisclosure } from '@mantine/hooks';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { RiLinksLine } from 'react-icons/ri';

export default function AccountPage() {
  const { signedIn } = useAuth();
  const { user, savePendingData } = useUser();
  const { completedTests = 0 } = user?.typingStats ?? {};
  const [profileEditModalOpened, profileEditModalHandler] = useDisclosure(false);

  const copyProfileURL = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}/user/${user?.name}`)
      .then(() => toast.success('URL copied to clipboard!'));
  };

  useEffect(() => {
    if (user) savePendingData();
  }, [savePendingData, user]);

  if (!signedIn) redirect('/');

  return user ? (
    <Transition className='flex w-full flex-col gap-6 self-center'>
      <UserDetails
        user={user}
        actions={
          <Group grow={false}>
            <Tooltip className='bg-bg' label='Copy profile URL'>
              <Button className='bg-bg px-2.5' onClick={copyProfileURL}>
                <RiLinksLine />
              </Button>
            </Tooltip>
            <Button active onClick={profileEditModalHandler.open}>
              edit profile
            </Button>
          </Group>
        }
        editable
      />
      <ProfileEditModal opened={profileEditModalOpened} onClose={profileEditModalHandler.close} />
      <PersonalBests data={user.personalBests} />
      {completedTests > 1 && <UserStats user={user} />}
      {completedTests > 0 && <TestHistory />}
    </Transition>
  ) : (
    <Loading />
  );
}
