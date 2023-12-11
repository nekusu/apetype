'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useDisclosure } from '@mantine/hooks';
import { Button, Divider, Modal, Text } from 'components/core';
import { ModalProps } from 'components/core/Modal';
import { useAuth } from 'context/authContext';
import { FirebaseError } from 'firebase/app';
import { AuthCredential, AuthProvider } from 'firebase/auth';
import { useDidMount } from 'hooks/useDidMount';
import { useCallback, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiLoaderLine } from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';
import { getFirebaseAuth } from 'utils/firebase';
import { AuthenticationMethod } from 'utils/firebase/auth';
import { z } from 'zod';
import { PasswordInput } from '.';

export interface ReauthenticationModalProps extends ModalProps {
  onReauthenticate?: (credential: AuthCredential | null) => void;
}

const formSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must have at least 8 characters'),
});
type FormValues = z.infer<typeof formSchema>;

export default function ReauthenticationModal({
  onClose,
  onReauthenticate,
  ...props
}: ReauthenticationModalProps) {
  const { currentUser } = useAuth();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<FormValues>({
    defaultValues: { password: '' },
    resolver: zodResolver(formSchema),
  });
  const [popupOpen, popupHandler] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMethods, setAuthMethods] = useState<AuthenticationMethod[]>();

  const reauthenticate = useCallback(
    async (credential: AuthCredential | null) => {
      const { auth, reauthenticateWithCredential } = await getFirebaseAuth();
      if (!auth.currentUser || !credential) return;
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
  const onSubmit: SubmitHandler<FormValues> = async ({ password }) => {
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
    void (async () => {
      const { authenticationMethods } = await getFirebaseAuth();
      setAuthMethods(authenticationMethods);
    })();
  });

  return (
    <Modal onClose={onClose} centered {...props}>
      <div
        className={twJoin([
          'max-w-xs min-w-xs flex flex-col gap-3.5 transition',
          (popupOpen || isLoading) && '!pointer-events-none !opacity-60',
        ])}
      >
        <Text asChild className='text-2xl'>
          <h3>Reauthenticate</h3>
        </Text>
        <Text className='text-sm' dimmed>
          Select method to reauthenticate:
        </Text>
        <div className='flex gap-2'>
          {authMethods?.map(({ name, provider, Icon, credentialFromResult }) => (
            <Button
              key={name}
              className='w-full'
              disabled={
                !currentUser?.providerData.some(
                  ({ providerId }) => providerId === provider.providerId,
                )
              }
              variant='filled'
              onClick={() => void reauthenticateWithProvider(provider, credentialFromResult)}
            >
              <Icon />
              {name}
            </Button>
          ))}
        </div>
        {currentUser?.providerData.some(({ providerId }) => providerId === 'password') && (
          <>
            <Divider label='or enter your password' />
            <form
              className='flex flex-col gap-3.5'
              onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            >
              <PasswordInput
                error={errors.password?.message}
                data-autofocus
                {...register('password')}
              />
              <Button className='h-9 w-full' variant='filled' type='submit'>
                {isLoading ? <RiLoaderLine className='animate-spin' /> : 'reauthenticate'}
              </Button>
            </form>
          </>
        )}
      </div>
    </Modal>
  );
}
