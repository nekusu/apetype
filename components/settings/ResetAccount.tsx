'use client';

import { useDisclosure } from '@mantine/hooks';
import { ReauthenticationModal } from 'components/auth';
import { Button, Modal, Text } from 'components/core';
import { useUser } from 'context/userContext';
import { FirebaseError } from 'firebase/app';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { RiLoaderLine } from 'react-icons/ri';
import { getFirebaseAuth, getFirebaseFirestore } from 'utils/firebase';
import { defaultUserDetails } from 'utils/user';
import Setting from './Setting';

export default function ResetAccount() {
  const { updateUser, deleteCachedUserData } = useUser();
  const [confirmationModalOpen, confirmationModalHandler] = useDisclosure(false);
  const [reauthModalOpen, reauthModalHandler] = useDisclosure(false);
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
        <Button className='w-full' onClick={confirmationModalHandler.open} variant='danger'>
          reset account
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
            <h3>Reset account</h3>
          </Text>
          <Text className='text-sm' dimmed>
            Are you sure you want to reset your account?
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
              onClick={() => reauthModalHandler.open()}
              variant='danger'
            >
              {isLoading ? <RiLoaderLine className='animate-spin' /> : 'reset'}
            </Button>
          </div>
        </div>
      </Modal>
      <ReauthenticationModal
        open={reauthModalOpen}
        onClose={reauthModalHandler.close}
        onReauthenticate={() => void resetAccount()}
      />
    </>
  );
}
