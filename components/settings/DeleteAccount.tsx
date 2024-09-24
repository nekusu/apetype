'use client';

import { deleteUser } from '@/app/@auth/actions';
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

export function DeleteAccount() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [confirmationModalOpened, confirmationModalHandler] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);

  const deleteAccount = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.storage
        .from('users')
        .remove([`avatars/${user.id}.png`, `banners/${user.id}.png`]);
      if (error) throw error;
      const res = await deleteUser(user.id);
      if (res?.error) throw res.error;
      queryClient.removeQueries({
        predicate: ({ queryKey }) =>
          queryKey.includes('users') ||
          queryKey.includes('user_stats') ||
          queryKey.includes('personal_bests') ||
          queryKey.includes('tests'),
      });
      confirmationModalHandler.close();
      toast.success('Your account has been successfully deleted.');
    } catch (e) {
      toast.error(`Failed to delete account! ${(e as Error).message}`);
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
            <Button loading={isLoading} onClick={deleteAccount} variant='danger'>
              delete
            </Button>
          </Group>
        </div>
      </Modal>
    </>
  );
}
