'use client';

import { type PasswordAuthInput, passwordAuthResolver } from '@/app/@auth/schemas';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { Button } from '@/components/core/Button';
import { Modal, type ModalProps } from '@/components/core/Modal';
import { Text } from '@/components/core/Text';
import { getAuthUser } from '@/queries/get-auth-user';
import supabase from '@/utils/supabase/browser';
import { useDisclosure } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import type { ZxcvbnResult } from '@zxcvbn-ts/core';
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Setting } from './Setting';

interface PasswordModalProps extends ModalProps {
  updatePassword: (password: string) => Promise<void>;
  passwordAuthenticated?: boolean;
  userInputs?: string[];
}

function PasswordModal({
  updatePassword,
  passwordAuthenticated,
  userInputs,
  ...props
}: PasswordModalProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm<PasswordAuthInput>({
    defaultValues: { password: '', confirmPassword: '' },
    resolver: passwordAuthResolver,
  });
  const [visiblePassword, setVisiblePassword] = useState(false);
  const password = watch('password');
  const deferredPassword = useDeferredValue(password);
  const [isLoading, setIsLoading] = useState(false);
  const handleResult = useCallback(
    (result: ZxcvbnResult | null) => setValue('passwordStrength', result ? result.score : 0),
    [setValue],
  );

  const onSubmit: SubmitHandler<PasswordAuthInput> = async ({ password }) => {
    setIsLoading(true);
    try {
      await updatePassword(password);
    } catch (e) {
      toast.error(`Failed to set password! ${(e as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal {...props}>
        <div className='flex min-w-xs max-w-xs flex-col gap-3.5 transition'>
          <Text asChild className='text-2xl'>
            <h3>{passwordAuthenticated ? 'Change' : 'Add'} password</h3>
          </Text>
          <form className='flex flex-col gap-3.5' onSubmit={handleSubmit(onSubmit)}>
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
            <Button loading={isLoading} type='submit'>
              save
            </Button>
          </form>
        </div>
      </Modal>
    </>
  );
}

export function PasswordAuthentication() {
  const { data: user, error, refetch } = useQuery(getAuthUser(supabase));
  const [passwordModalOpened, passwordModalHandler] = useDisclosure(false);
  const passwordAuthenticated = !!user?.user_metadata.password_authenticated;
  const userInputs = useMemo(
    () => [user?.user_metadata?.name ?? '', user?.user_metadata?.email ?? ''],
    [user],
  );
  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
      // biome-ignore lint/style/useNamingConvention: metadata is not camelCase
      data: { password_authenticated: true },
    });
    if (error) throw error;
    await refetch();
    toast.success(
      `Your password has been successfully ${passwordAuthenticated ? 'changed' : 'added'}.`,
    );
    passwordModalHandler.close();
  };

  useEffect(() => {
    if (error) toast.error(`Failed to get user metadata! ${error.message}`);
  }, [error]);

  return (
    <>
      <Setting
        id='passwordAuthentication'
        customDescription={() =>
          passwordAuthenticated ? 'Change your password.' : 'Add password authentication.'
        }
      >
        <Button
          onClick={passwordModalHandler.open}
          variant={passwordAuthenticated ? 'danger' : 'filled'}
        >
          {passwordAuthenticated ? 'change' : 'add'} password
        </Button>
      </Setting>
      <PasswordModal
        opened={passwordModalOpened}
        onClose={passwordModalHandler.close}
        updatePassword={updatePassword}
        passwordAuthenticated={passwordAuthenticated}
        userInputs={userInputs}
      />
    </>
  );
}
