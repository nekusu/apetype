'use client';

import { Button, Divider, Group, Modal, Text } from '@/components/core';
import type { ModalProps } from '@/components/core/Modal';
import { useAuth } from '@/context/authContext';
import { useDidMount } from '@/hooks/useDidMount';
import { getFirebaseAuth } from '@/utils/firebase';
import type { AuthenticationMethod } from '@/utils/firebase/auth';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { useDisclosure } from '@mantine/hooks';
import type { FirebaseError } from 'firebase/app';
import type { AuthCredential, AuthProvider } from 'firebase/auth';
import { useCallback, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { type Input as ValiInput, minLength, object, string } from 'valibot';
import { PasswordInput } from '.';

export interface ReauthenticationModalProps extends ModalProps {
  onReauthenticate?: (credential: AuthCredential | null) => void;
}

const passwordSchema = object({
  password: string([
    minLength(1, 'Password is required'),
    minLength(8, 'Password must have at least 8 characters'),
  ]),
});
type PasswordForm = ValiInput<typeof passwordSchema>;

export default function ReauthenticationModal({
  onReauthenticate,
  ...props
}: ReauthenticationModalProps) {
  const { onClose } = props;
  const { currentUser } = useAuth();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<PasswordForm>({
    defaultValues: { password: '' },
    resolver: valibotResolver(passwordSchema),
  });
  const [popupOpened, popupHandler] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMethods, setAuthMethods] = useState<AuthenticationMethod[]>();

  const reauthenticate = useCallback(
    async (credential: AuthCredential | null) => {
      const { auth, reauthenticateWithCredential } = await getFirebaseAuth();
      if (!(auth.currentUser && credential)) return;
      await reauthenticateWithCredential(auth.currentUser, credential);
      onReauthenticate?.(credential);
      onClose?.();
    },
    [onClose, onReauthenticate],
  );
  const reauthenticateWithProvider = useCallback(
    async (
      provider: AuthProvider,
      credentialFromResult: AuthenticationMethod['credentialFromResult'],
    ) => {
      const { auth, signInWithPopup } = await getFirebaseAuth();
      try {
        popupHandler.open();
        const result = await signInWithPopup(auth, provider);
        const credential = credentialFromResult(result);
        await reauthenticate(credential);
      } catch (e) {
        toast.error(`Something went wrong! ${(e as FirebaseError).message}`);
      } finally {
        popupHandler.close();
      }
    },
    [popupHandler, reauthenticate],
  );
  const onSubmit: SubmitHandler<PasswordForm> = async ({ password }) => {
    const { auth, EmailAuthProvider } = await getFirebaseAuth();
    if (!auth.currentUser?.email) return;
    try {
      setIsLoading(true);
      const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
      await reauthenticate(credential);
    } catch (e) {
      const error = e as FirebaseError;
      if (error.code === 'auth/wrong-password')
        setError('password', { message: 'Wrong password' }, { shouldFocus: true });
      else toast.error(`Something went wrong! ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useDidMount(() => {
    (async () => {
      const { authenticationMethods } = await getFirebaseAuth();
      setAuthMethods(authenticationMethods);
    })();
  });

  return (
    <Modal {...props}>
      <div className='flex min-w-xs max-w-xs flex-col gap-3.5 transition'>
        <Text asChild className='text-2xl'>
          <h3>Reauthenticate</h3>
        </Text>
        <Text className='text-sm' dimmed>
          Select method to reauthenticate:
        </Text>
        <Group>
          {authMethods?.map(({ name, provider, icon: Icon, credentialFromResult }) => (
            <Button
              key={name}
              disabled={
                isLoading ||
                !currentUser?.providerData.some(
                  ({ providerId }) => providerId === provider.providerId,
                )
              }
              onClick={() => reauthenticateWithProvider(provider, credentialFromResult)}
            >
              <Icon />
              {name}
            </Button>
          ))}
        </Group>
        {currentUser?.providerData.some(({ providerId }) => providerId === 'password') && (
          <>
            <Divider label='or enter your password' />
            <form className='flex flex-col gap-3.5' onSubmit={handleSubmit(onSubmit)}>
              <PasswordInput
                error={errors.password?.message}
                data-autofocus
                {...register('password')}
              />
              <Button disabled={popupOpened} loading={isLoading} type='submit'>
                reauthenticate
              </Button>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
