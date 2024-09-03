'use client';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { useDisclosure } from '@mantine/hooks';
import { ZxcvbnResult } from '@zxcvbn-ts/core';
import { PasswordInput, PasswordStrength, ReauthenticationModal } from 'components/auth';
import { Button, Modal, Text } from 'components/core';
import { ModalProps } from 'components/core/Modal';
import { useAuth } from 'context/authContext';
import { FirebaseError } from 'firebase/app';
import { useCallback, useDeferredValue, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiLoaderLine } from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';
import { getFirebaseAuth } from 'utils/firebase';
import { Input as ValiInput, custom, forward, minLength, number, object, string } from 'valibot';
import Setting from './Setting';

interface PasswordModalProps extends ModalProps {
  updatePassword: (password: string) => Promise<void>;
  passwordAuthenticated?: boolean;
}

const passwordSchema = object(
  {
    password: string([
      minLength(1, 'Password is required'),
      minLength(8, 'Password must have at least 8 characters'),
    ]),
    confirmPassword: string([minLength(1, 'Password confirmation is required')]),
    passwordStrength: number(),
  },
  [
    forward(
      custom(
        ({ password, confirmPassword }) => password === confirmPassword,
        'Passwords do not match',
      ),
      ['confirmPassword'],
    ),
    forward(
      custom(({ passwordStrength }) => passwordStrength >= 2, 'Password is too weak'),
      ['password'],
    ),
  ],
);
type PasswordForm = ValiInput<typeof passwordSchema>;

function PasswordModal({ updatePassword, passwordAuthenticated, ...props }: PasswordModalProps) {
  const { currentUser } = useAuth();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<PasswordForm>({
    defaultValues: { password: '', confirmPassword: '' },
    resolver: valibotResolver(passwordSchema),
  });
  const [reauthModalOpen, reauthModalHandler] = useDisclosure(false);
  const [visiblePassword, setVisiblePassword] = useState(false);
  const password = watch('password');
  const [userInputs, setUserInputs] = useState(['', '']);
  const deferredPassword = useDeferredValue(password);
  const [isLoading, setIsLoading] = useState(false);
  const handleResult = useCallback(
    (result: ZxcvbnResult | null) => setValue('passwordStrength', result ? result.score : 0),
    [setValue],
  );

  const handlePassword = async (password: string) => {
    try {
      setIsLoading(true);
      await updatePassword(password);
    } catch (e) {
      const error = e as FirebaseError;
      if (error.code === 'auth/requires-recent-login') reauthModalHandler.open();
      else toast.error(`Something went wrong! ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  const onSubmit: SubmitHandler<PasswordForm> = async ({ password }) => handlePassword(password);

  useEffect(() => {
    setUserInputs([currentUser?.displayName ?? '', currentUser?.email ?? '']);
  }, [currentUser?.displayName, currentUser?.email]);

  return (
    <>
      <Modal centered {...props}>
        <div
          className={twJoin(
            'max-w-xs min-w-xs flex flex-col gap-3.5 transition',
            isLoading && 'pointer-events-none opacity-60',
          )}
        >
          <Text asChild className='text-2xl'>
            <h3>{passwordAuthenticated ? 'Change' : 'Add'} password</h3>
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
  const { currentUser } = useAuth();
  const [passwordModalOpen, passwordModalHandler] = useDisclosure(false);
  const [passwordAuthenticated, setPasswordAuthenticated] = useState(false);

  const updatePassword = async (password: string) => {
    const { auth, updatePassword: _updatePassword } = await getFirebaseAuth();
    if (!auth.currentUser) return;
    await _updatePassword(auth.currentUser, password);
    toast.success(
      `Your password has been successfully ${passwordAuthenticated ? 'changed' : 'added'}.`,
    );
    setPasswordAuthenticated(true);
    passwordModalHandler.close();
  };

  useEffect(() => {
    setPasswordAuthenticated(
      !!currentUser?.providerData.some(({ providerId }) => providerId === 'password'),
    );
  }, [currentUser?.providerData]);

  return (
    <>
      <Setting
        id='passwordAuthentication'
        customDescription={() =>
          passwordAuthenticated ? 'Change your password.' : 'Add password authentication.'
        }
      >
        <Button
          className='w-full'
          onClick={passwordModalHandler.open}
          variant={passwordAuthenticated ? 'danger' : 'filled'}
        >
          {passwordAuthenticated ? 'change' : 'add'} password
        </Button>
      </Setting>
      <PasswordModal
        open={passwordModalOpen}
        onClose={passwordModalHandler.close}
        updatePassword={updatePassword}
        passwordAuthenticated={passwordAuthenticated}
      />
    </>
  );
}
