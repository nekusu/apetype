'use client';

import { ReauthenticationModal } from '@/components/auth';
import { Button, Group, Modal, Text } from '@/components/core';
import { useUser } from '@/context/userContext';
import { getFirebaseAuth, getFirebaseFirestore } from '@/utils/firebase';
import { defaultUserDetails } from '@/utils/user';
import { useDisclosure } from '@mantine/hooks';
import type { FirebaseError } from 'firebase/app';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Setting from './Setting';

export default function ResetAccount() {
  const { updateUser, deleteCachedUserData } = useUser();
  const [confirmationModalOpened, confirmationModalHandler] = useDisclosure(false);
  const [reauthModalOpened, reauthModalHandler] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetAccount = async () => {
    const [{ auth }, { deleteCollection, deleteField }] = await Promise.all([
      getFirebaseAuth(),
      getFirebaseFirestore(),
    ]);
    if (!auth.currentUser) return;
    try {
      setIsLoading(true);
      await Promise.all([
        updateUser({
          personalBests: deleteField(),
          typingStats: defaultUserDetails.typingStats,
        }),
        deleteCollection(`users/${auth.currentUser.uid}/tests`, 300),
        deleteCachedUserData('tests'),
      ]);
      toast.success('Your account has been successfully reset.');
      confirmationModalHandler.close();
    } catch (e) {
      const error = e as FirebaseError;
      toast.error(`Something went wrong! ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Setting id='resetAccount'>
        <Button onClick={confirmationModalHandler.open} variant='danger'>
          reset account
        </Button>
      </Setting>
      <Modal
        className='w-full max-w-sm'
        opened={confirmationModalOpened}
        onClose={confirmationModalHandler.close}
      >
        <div className='flex flex-col gap-3.5'>
          <Text asChild className='text-2xl'>
            <h3>Reset account</h3>
          </Text>
          <Text className='text-sm' dimmed>
            Are you sure you want to reset your account?
            <br />
            <span className='text-error'>After pressing the button everything will be gone.</span>
          </Text>
          <Group>
            <Button onClick={confirmationModalHandler.close}>cancel</Button>
            <Button loading={isLoading} onClick={reauthModalHandler.open} variant='danger'>
              reset
            </Button>
          </Group>
        </div>
      </Modal>
      <ReauthenticationModal
        opened={reauthModalOpened}
        onClose={reauthModalHandler.close}
        onReauthenticate={resetAccount}
      />
    </>
  );
}
