'use client';

import { useDisclosure } from '@mantine/hooks';
import { ReauthenticationModal } from 'components/auth';
import { Button, Modal, Text } from 'components/core';
import { FirebaseError } from 'firebase/app';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { RiLoaderLine } from 'react-icons/ri';
import { getFirebaseAuth, getFirebaseFirestore } from 'utils/firebase';
import Setting from './Setting';

export default function DeleteAccount() {
  const [confirmationModalOpen, confirmationModalHandler] = useDisclosure(false);
  const [reauthModalOpen, reauthModalHandler] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);

  const deleteAccount = async () => {
    const [{ auth, deleteUser }, { deleteDocument }] = await Promise.all([
      getFirebaseAuth(),
      getFirebaseFirestore(),
    ]);
    if (!auth.currentUser) return;
    try {
      setIsLoading(true);
      await deleteDocument('users', auth.currentUser.uid);
      await deleteUser(auth.currentUser);
      toast.success('Your account has been successfully deleted.');
      confirmationModalHandler.close();
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
        <Button className='w-full' onClick={confirmationModalHandler.open} variant='danger'>
          delete account
        </Button>
      </Setting>
      <Modal
        className='max-w-sm w-full'
        open={confirmationModalOpen}
        onClose={confirmationModalHandler.close}
        centered
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
          <div className='flex gap-2'>
            <Button className='w-full' onClick={confirmationModalHandler.close} variant='filled'>
              cancel
            </Button>
            <Button
              className='w-full'
              disabled={isLoading}
              onClick={() => void deleteAccount()}
              variant='danger'
            >
              {isLoading ? <RiLoaderLine className='animate-spin' /> : 'delete'}
            </Button>
          </div>
        </div>
      </Modal>
      <ReauthenticationModal
        open={reauthModalOpen}
        onClose={reauthModalHandler.close}
        onReauthenticate={() => void deleteAccount()}
      />
    </>
  );
}
