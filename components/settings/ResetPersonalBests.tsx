'use client';

import { ReauthenticationModal } from '@/components/auth';
import { Button, Group, Modal, Text } from '@/components/core';
import { useUser } from '@/context/userContext';
import { getFirebaseFirestore } from '@/utils/firebase';
import { useDisclosure } from '@mantine/hooks';
import type { FirebaseError } from 'firebase/app';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Setting from './Setting';

export default function ResetPersonalBests() {
  const { updateUser } = useUser();
  const [confirmationModalOpened, confirmationModalHandler] = useDisclosure(false);
  const [reauthModalOpened, reauthModalHandler] = useDisclosure(false);
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
        <Button onClick={confirmationModalHandler.open} variant='danger'>
          reset personal bests
        </Button>
      </Setting>
      <Modal
        className='w-full max-w-sm'
        opened={confirmationModalOpened}
        onClose={confirmationModalHandler.close}
      >
        <div className='flex flex-col gap-3.5'>
          <Text asChild className='text-2xl'>
            <h3>Reset personal bests</h3>
          </Text>
          <Text className='text-sm' dimmed>
            Are you sure you want to reset your personal bests?
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
        onReauthenticate={resetPersonalBests}
      />
    </>
  );
}
