'use client';

import Loading from '@/app/loading';
import { Button } from '@/components/core/Button';
import { Group } from '@/components/core/Group';
import { Tooltip } from '@/components/core/Tooltip';
import { Transition } from '@/components/core/Transition';
import { PersonalBests } from '@/components/profile/PersonalBests';
import type { SetImageModalProps } from '@/components/profile/SetImageModal';
import { TestHistory } from '@/components/profile/TestHistory';
import { UserDetails } from '@/components/profile/UserDetails';
import { UserStats } from '@/components/profile/UserStats';
import { useUser } from '@/context/userContext';
import { getUserStatsById } from '@/queries/get-user-stats-by-id';
import supabase from '@/utils/supabase/browser';
import type { Enums } from '@/utils/supabase/database';
import type { TableUpdate } from '@/utils/supabase/database-extended';
import { useDisclosure } from '@mantine/hooks';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { capitalize } from 'radashi';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { RiEarthFill, RiLink, RiPencilFill } from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';

const ProfileEditModal = dynamic(() =>
  import('@/components/profile/ProfileEditModal').then(({ ProfileEditModal }) => ProfileEditModal),
);
const SetImageModal = dynamic(() =>
  import('@/components/profile/SetImageModal').then(({ SetImageModal }) => SetImageModal),
);

export default function AccountPage() {
  const { user, updateUser } = useUser();
  const { data: userStats } = useQuery(getUserStatsById(supabase, user?.id), {
    enabled: !!user?.id,
  });
  const { completedTests = 0 } = userStats ?? {};
  const [imageType, setImageType] = useState<'avatar' | 'banner'>('avatar');
  const [setImageModalOpened, setImageModalHandler] = useDisclosure(false);
  const [profileEditModalOpened, profileEditModalHandler] = useDisclosure(false);

  if (!user) return <Loading />;

  const saveImage = async (imageBlob: Blob | null, shape: Enums<'avatarShape'>) => {
    const userData: TableUpdate<'users'> = { id: user.id };
    if (imageBlob) {
      const { data, error } = await supabase.storage
        .from('users')
        .upload(`${imageType}s/${user.id}.webp`, imageBlob, { upsert: true });
      if (error) throw error;
      userData[`${imageType}URL`] =
        `${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL}/storage/v1/object/public/users/${data.path}?timestamp=${dayjs().unix()}`;
    }
    if (imageType === 'avatar') userData.avatarShape = shape;
    await updateUser(userData);
    toast.success(`${capitalize(imageType)} updated successfully!`);
  };
  const deleteImage = async () => {
    const [{ error }] = await Promise.all([
      supabase.storage.from('users').remove([`${imageType}s/${user.id}.webp`]),
      updateUser({ [`${imageType}URL`]: null }),
    ]);
    if (error) throw error;
    toast.success(`${capitalize(imageType)} deleted successfully!`);
  };
  const copyProfileURL = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}/user/${user.name}`)
      .then(() => toast.success('URL copied to clipboard!'));
  };

  const setImageModalProps: Partial<SetImageModalProps> =
    imageType === 'avatar'
      ? { aspect: 1, initialShape: user.avatarShape, targetHeight: 500, targetWidth: 500 }
      : { aspect: 4, initialShape: 'rect', targetHeight: 300, targetWidth: 1200 };

  return (
    <Transition className='flex w-full flex-col gap-6 self-center'>
      <UserDetails
        user={user}
        startedTests={userStats?.startedTests}
        completedTests={userStats?.completedTests}
        timeTyping={userStats?.timeTyping}
        actions={{
          avatar: (
            <Tooltip className='bg-bg' label='Change avatar'>
              <Button
                active
                className={twJoin(
                  'absolute px-2 opacity-0 shadow-md group-hover:opacity-100 group-has-focus-visible:opacity-100',
                  user.avatarShape === 'rect'
                    ? 'right-3 bottom-3'
                    : 'right-4 bottom-4 rounded-full',
                )}
                onClick={() => {
                  setImageType('avatar');
                  setImageModalHandler.open();
                }}
              >
                <RiPencilFill />
              </Button>
            </Tooltip>
          ),
          banner: (
            <Tooltip className='bg-bg' label='Change banner'>
              <Button
                active
                className='absolute right-6 bottom-4 px-2 opacity-0 shadow-md group-hover:opacity-100 group-has-focus-visible:opacity-100'
                onClick={() => {
                  setImageType('banner');
                  setImageModalHandler.open();
                }}
              >
                <RiPencilFill />
              </Button>
            </Tooltip>
          ),
        }}
      >
        <Group grow={false}>
          <Button active onClick={profileEditModalHandler.open}>
            edit profile
          </Button>
          <Tooltip className='bg-bg' label='Copy profile URL'>
            <Button className='bg-bg px-2.5' onClick={copyProfileURL}>
              <RiLink />
            </Button>
          </Tooltip>
          <Tooltip className='bg-bg' label='View public profile'>
            <Button asChild className='bg-bg px-2.5'>
              <Link href={`/user/${user.name}`}>
                <RiEarthFill />
              </Link>
            </Button>
          </Tooltip>
        </Group>
      </UserDetails>
      <PersonalBests userId={user.id} />
      {completedTests > 1 && <UserStats userId={user.id} />}
      {completedTests > 0 && <TestHistory userId={user.id} />}
      <SetImageModal
        opened={setImageModalOpened}
        onClose={setImageModalHandler.close}
        title={`Change ${imageType}`}
        enableShapeSelection={imageType === 'avatar'}
        onDelete={user[`${imageType}URL`] ? deleteImage : undefined}
        onSave={saveImage}
        {...setImageModalProps}
      />
      <ProfileEditModal opened={profileEditModalOpened} onClose={profileEditModalHandler.close} />
    </Transition>
  );
}
