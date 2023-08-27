'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useDidUpdate, useDisclosure, useForceUpdate } from '@mantine/hooks';
import { ZxcvbnResult } from '@zxcvbn-ts/core';
import { PasswordInput, PasswordStrength, ReauthenticationModal } from 'components/auth';
import { Button, Modal, Text } from 'components/core';
import { ModalProps } from 'components/core/Modal';
import { FirebaseError } from 'firebase/app';
import { EmailAuthProvider, linkWithCredential, updatePassword } from 'firebase/auth';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiLoaderLine } from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';
import { auth } from 'utils/firebase';
import { z } from 'zod';
import Setting from './Setting';

interface PasswordModalProps extends ModalProps {
  addPassword: (password: string) => Promise<void>;
  changePassword: (password: string) => Promise<void>;
  isPasswordAuthenticated?: boolean;
}

const formSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must have at least 8 characters'),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });
type FormValues = z.infer<typeof formSchema>;

function PasswordModal({
  addPassword,
  changePassword,
  isPasswordAuthenticated,
  ...props
}: PasswordModalProps) {
  const [passwordStrength, setPasswordStrength] = useState<ZxcvbnResult | null>(null);
  const {
    formState: { isSubmitted, errors },
    handleSubmit,
    register,
    trigger,
    watch,
  } = useForm<FormValues>({
    defaultValues: { password: '', confirmPassword: '' },
    resolver: zodResolver(
      formSchema.refine(() => passwordStrength && passwordStrength.score >= 2, {
        path: ['password'],
        message: 'Password is too weak',
      }),
    ),
    reValidateMode: 'onSubmit',
  });
  const [reauthModalOpen, reauthModalHandler] = useDisclosure(false);
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [password, confirmPassword] = watch(['password', 'confirmPassword']);
  const userInputs = useMemo(() => {
    const user = auth.currentUser;
    return [user?.displayName ?? '', user?.email ?? ''];
  }, []);
  const deferredPassword = useDeferredValue(password);
  const [isLoading, setIsLoading] = useState(false);
  const handleResult = useCallback((result: ZxcvbnResult) => setPasswordStrength(result), []);

  const handlePassword = async (password: string) => {
    try {
      setIsLoading(true);
      if (isPasswordAuthenticated) await changePassword(password);
      else await addPassword(password);
    } catch (e) {
      const error = e as FirebaseError;
      console.error(error);
      if (error.code === 'auth/requires-recent-login') reauthModalHandler.open();
      else toast.error(`Something went wrong! ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  const onSubmit: SubmitHandler<FormValues> = async ({ password }) => handlePassword(password);

  useDidUpdate(() => {
    if (isSubmitted) void trigger();
  }, [passwordStrength, confirmPassword]);

  return (
    <>
      <Modal centered {...props}>
        <div
          className={twJoin([
            'max-w-xs min-w-xs flex flex-col gap-3.5 transition',
            isLoading && 'pointer-events-none opacity-60',
          ])}
        >
          <Text asChild className='text-2xl'>
            <h3>{isPasswordAuthenticated ? 'Change' : 'Add'} password</h3>
          </Text>
          <form className='flex flex-col gap-3.5' onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
            <div className='flex flex-col gap-2'>
              <PasswordInput
                error={errors.password?.message}
                visible={visiblePassword}
                onVisibilityChange={setVisiblePassword}
                data-autofocus
                {...register('password')}
              />
              <PasswordInput
                placeholder='confirm password'
                error={errors.confirmPassword?.message}
                visible={visiblePassword}
                onVisibilityChange={setVisiblePassword}
                {...register('confirmPassword')}
              />
            </div>
            <PasswordStrength
              password={deferredPassword}
              userInputs={userInputs}
              onResult={handleResult}
            />
            <Button className='h-9 w-full' variant='filled' type='submit'>
              {isLoading ? <RiLoaderLine className='animate-spin' /> : 'save'}
            </Button>
          </form>
        </div>
      </Modal>
      <ReauthenticationModal
        open={reauthModalOpen}
        onClose={reauthModalHandler.close}
        onReauthenticate={() => void handlePassword(password)}
      />
    </>
  );
}

export default function PasswordAuthentication() {
  const forceUpdate = useForceUpdate();
  const [passwordModalOpen, passwordModalHandler] = useDisclosure(false);
  const isPasswordAuthenticated = auth.currentUser?.providerData.some(
    ({ providerId }) => providerId === 'password',
  );

  const addPassword = async (password: string) => {
    if (!auth.currentUser?.email) return;
    const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
    await linkWithCredential(auth.currentUser, credential);
    toast.success('Your password has been successfully added.');
    passwordModalHandler.close();
    forceUpdate();
  };
  const changePassword = async (password: string) => {
    if (!auth.currentUser) return;
    await updatePassword(auth.currentUser, password);
    toast.success('Your password has been successfully changed.');
    passwordModalHandler.close();
    forceUpdate();
  };

  return (
    <>
      <Setting
        id='passwordAuthentication'
        customDescription={() => (
          <>{isPasswordAuthenticated ? 'Change your password.' : 'Add password authentication.'}</>
        )}
      >
        <Button
          className='w-full'
          onClick={passwordModalHandler.open}
          variant={isPasswordAuthenticated ? 'danger' : 'filled'}
        >
          {isPasswordAuthenticated ? 'change' : 'add'} password
        </Button>
      </Setting>
      <PasswordModal
        open={passwordModalOpen}
        onClose={passwordModalHandler.close}
        addPassword={addPassword}
        changePassword={changePassword}
        isPasswordAuthenticated={isPasswordAuthenticated}
      />
    </>
  );
}
