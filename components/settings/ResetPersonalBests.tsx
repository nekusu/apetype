'use client';

import { ReauthenticationModal } from '@/components/auth';
import { Button, Modal, Text } from '@/components/core';
import { useUser } from '@/context/userContext';
import { getFirebaseFirestore } from '@/utils/firebase';
import { useDisclosure } from '@mantine/hooks';
import type { FirebaseError } from 'firebase/app';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { RiLoaderLine } from 'react-icons/ri';
import Setting from './Setting';

export default function ResetPersonalBests() {
  const { updateUser } = useUser();
  const [confirmationModalOpen, confirmationModalHandler] = useDisclosure(false);
  const [reauthModalOpen, reauthModalHandler] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetPersonalBests = async () => {
    const { deleteField } = await getFirebaseFirestore();
    try {
      setIsLoading(true);
      await updateUser({ personalBests: deleteField() });
      toast.success('Your personal bests have been successfully reset.');
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
      <Setting id='resetPersonalBests'>
        <Button className='w-full' onClick={confirmationModalHandler.open} variant='danger'>
          reset personal bests
        </Button>
      </Setting>
      <Modal
        className='w-full max-w-sm'
        open={confirmationModalOpen}
        onClose={confirmationModalHandler.close}
        centered
      >
        <div className='flex flex-col gap-3.5'>
          <Text asChild className='text-2xl'>
            <h3>Reset personal bests</h3>
          </Text>
          <Text className='text-sm' dimmed>
            Are you sure you want to reset your personal bests?
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
        onReauthenticate={() => void resetPersonalBests()}
      />
    </>
  );
}
