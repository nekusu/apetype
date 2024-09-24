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

export function ResetAccount() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [confirmationModalOpened, confirmationModalHandler] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);

  const resetAccount = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await Promise.all([
        supabase.from('user_stats').delete().eq('userId', user.id).throwOnError(),
        supabase.from('personal_bests').delete().eq('userId', user.id).throwOnError(),
        supabase.from('tests').delete().eq('userId', user.id).throwOnError(),
      ]);
      queryClient.removeQueries({
        predicate: ({ queryKey }) =>
          queryKey.includes('user_stats') ||
          queryKey.includes('personal_bests') ||
          queryKey.includes('tests'),
      });
      toast.success('Your account has been successfully reset.');
      confirmationModalHandler.close();
    } catch (e) {
      toast.error(`Failed to sign out! ${(e as Error).message}`);
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
            <Button loading={isLoading} onClick={resetAccount} variant='danger'>
              reset
            </Button>
          </Group>
        </div>
      </Modal>
    </>
  );
}
