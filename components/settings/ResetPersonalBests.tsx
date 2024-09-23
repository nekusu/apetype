'use client';

import { Button } from '@/components/core/Button';
import { Group } from '@/components/core/Group';
import { Modal } from '@/components/core/Modal';
import { Text } from '@/components/core/Text';
import { useUser } from '@/context/userContext';
import supabase from '@/utils/supabase/browser';
import { useDisclosure } from '@mantine/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Setting } from './Setting';

export function ResetPersonalBests() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [confirmationModalOpened, confirmationModalHandler] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetPersonalBests = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await supabase.from('personal_bests').delete().eq('userId', user.id);
      await queryClient.invalidateQueries({
        predicate: ({ queryKey }) => queryKey.includes('personal_bests'),
      });
      toast.success('Your personal bests have been successfully reset.');
      confirmationModalHandler.close();
    } catch (e) {
      toast.error(`Failed to reset personal bests! ${(e as Error).message}`);
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
            <Button loading={isLoading} onClick={resetPersonalBests} variant='danger'>
              reset
            </Button>
          </Group>
        </div>
      </Modal>
    </>
  );
}
