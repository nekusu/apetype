'use client';

import { ReauthenticationModal } from '@/components/auth';
import { Button, Group, Modal, Text } from '@/components/core';
import { useUser } from '@/context/userContext';
import { getFirebaseAuth, getFirebaseFirestore } from '@/utils/firebase';
import { useDisclosure } from '@mantine/hooks';
import type { FirebaseError } from 'firebase/app';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Setting from './Setting';

export default function DeleteAccount() {
  const { deleteCachedUserData } = useUser();
  const [confirmationModalOpened, confirmationModalHandler] = useDisclosure(false);
  const [reauthModalOpened, reauthModalHandler] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);

  const deleteAccount = async () => {
    const [{ auth, deleteUser }, { deleteCollection, deleteDocument }] = await Promise.all([
      getFirebaseAuth(),
      getFirebaseFirestore(),
    ]);
    if (!auth.currentUser) return;
    try {
      setIsLoading(true);
      await Promise.all([
        deleteDocument('users', auth.currentUser.uid),
        deleteCollection(`users/${auth.currentUser.uid}/tests}`, 300),
        deleteCachedUserData(),
      ]);
      confirmationModalHandler.close();
      await deleteUser(auth.currentUser);
      toast.success('Your account has been successfully deleted.');
    } catch (e) {
      const error = e as FirebaseError;
      if (error.code === 'auth/requires-recent-login') reauthModalHandler.open();
      else toast.error(`Something went wrong! ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Setting id='deleteAccount'>
        <Button onClick={confirmationModalHandler.open} variant='danger'>
          delete account
        </Button>
      </Setting>
      <Modal
        className='w-full max-w-sm'
        opened={confirmationModalOpened}
        onClose={confirmationModalHandler.close}
      >
        <div className='flex flex-col gap-3.5'>
          <Text asChild className='text-2xl'>
            <h3>Delete account</h3>
          </Text>
          <Text className='text-sm' dimmed>
            Are you sure you want to delete your account?
            <br />
            <span className='text-error'>After pressing the button everything will be gone.</span>
          </Text>
          <Group>
            <Button onClick={confirmationModalHandler.close}>cancel</Button>
            <Button loading={isLoading} onClick={reauthModalHandler.open} variant='danger'>
              delete
            </Button>
          </Group>
        </div>
      </Modal>
      <ReauthenticationModal
        opened={reauthModalOpened}
        onClose={reauthModalHandler.close}
        onReauthenticate={deleteAccount}
      />
    </>
  );
}
