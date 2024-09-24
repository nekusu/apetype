'use client';

import { EmailToast } from '@/components/auth/EmailToast';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/Input';
import { Text } from '@/components/core/Text';
import { Transition } from '@/components/core/Transition';
import { useUser } from '@/context/userContext';
import { getAuthUser } from '@/queries/get-auth-user';
import { getURL } from '@/utils/supabase/auth';
import supabase from '@/utils/supabase/browser';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { useFocusTrap } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import type { ZxcvbnResult } from '@zxcvbn-ts/core';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiMailFill } from 'react-icons/ri';
import { type InferInput, object } from 'valibot';
import { EmailSchema, type PasswordAuthInput, passwordAuthResolver } from '../schemas';

const EmailFormSchema = object({ email: EmailSchema });
type EmailFormInput = InferInput<typeof EmailFormSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const {
    data: authUser,
    error,
    refetch,
  } = useQuery({ ...getAuthUser(supabase), enabled: !!user });
  const emailForm = useForm<EmailFormInput>({
    defaultValues: { email: '' },
    resolver: valibotResolver(EmailFormSchema),
  });
  const passwordForm = useForm<PasswordAuthInput>({
    defaultValues: { password: '', confirmPassword: '' },
    resolver: passwordAuthResolver,
  });
  const [visiblePassword, setVisiblePassword] = useState(false);
  const password = passwordForm.watch('password');
  const deferredPassword = useDeferredValue(password);
  const userInputs = useMemo(
    () => [authUser?.user_metadata?.name ?? '', authUser?.user_metadata?.email ?? ''],
    [authUser],
  );
  const focusTrapRef = useFocusTrap();
  const [isLoading, setIsLoading] = useState(false);
  const handleResult = useCallback(
    (result: ZxcvbnResult | null) =>
      passwordForm.setValue('passwordStrength', result ? result.score : 0),
    [passwordForm.setValue],
  );

  const onEmailSubmit: SubmitHandler<EmailFormInput> = async ({ email }) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getURL()}/auth/confirm`,
      });
      if (error) throw error;
      await refetch();
      toast(
        (t) => (
          <EmailToast
            {...t}
            message='Please check your email and click the link to reset your password.'
            emailDomain={email.split('@')[1]}
          />
        ),
        { duration: Number.POSITIVE_INFINITY },
      );
      router.push('/');
    } catch (e) {
      toast.error(`Failed to send email! ${(e as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };
  const onPasswordSubmit: SubmitHandler<PasswordAuthInput> = async ({ password }) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password,
        // biome-ignore lint/style/useNamingConvention: metadata is not camelCase
        data: { password_authenticated: true },
      });
      if (error) throw error;
      toast.success('Your password has been successfully updated.');
      router.push('/');
    } catch (e) {
      toast.error(`Failed to update password! ${(e as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (error) toast.error(`Failed to get user data! ${error.message}`);
  }, [error]);
  useEffect(() => {
    const email = searchParams.get('email');
    if (email) emailForm.setValue('email', email);
  }, [searchParams, emailForm.setValue]);

  return (
    <Transition ref={focusTrapRef} className='flex min-w-xs max-w-xs flex-col gap-3.5 transition'>
      <Text asChild className='text-2xl'>
        <h3>{user ? 'Reset password' : 'Send reset password email'}</h3>
      </Text>
      <form
        className='flex flex-col gap-3.5'
        onSubmit={
          user ? passwordForm.handleSubmit(onPasswordSubmit) : emailForm.handleSubmit(onEmailSubmit)
        }
      >
        {user ? (
          <>
            <div className='flex flex-col gap-2'>
              <PasswordInput
                error={passwordForm.formState.errors.password?.message}
                visible={visiblePassword}
                onVisibilityChange={setVisiblePassword}
                data-autofocus
                {...passwordForm.register('password')}
              />
              <PasswordInput
                placeholder='confirm password'
                error={passwordForm.formState.errors.confirmPassword?.message}
                visible={visiblePassword}
                onVisibilityChange={setVisiblePassword}
                {...passwordForm.register('confirmPassword')}
              />
            </div>
            <PasswordStrength
              password={deferredPassword}
              userInputs={userInputs}
              onResult={handleResult}
            />
          </>
        ) : (
          <Input
            placeholder='email'
            error={emailForm.formState.errors.email?.message}
            type='email'
            leftNode={<RiMailFill />}
            data-autofocus
            {...emailForm.register('email')}
          />
        )}
        <Button loading={isLoading} type='submit'>
          {user ? 'save' : 'send'}
        </Button>
      </form>
    </Transition>
  );
}
