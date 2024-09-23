'use client';

import { EmailToast } from '@/components/auth/EmailToast';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { SignInMethods } from '@/components/auth/SignInMethods';
import { Button } from '@/components/core/Button';
import { Divider } from '@/components/core/Divider';
import { Input } from '@/components/core/Input';
import { Text } from '@/components/core/Text';
import { Transition } from '@/components/core/Transition';
import { useFocusTrap } from '@mantine/hooks';
import type { AuthError } from '@supabase/supabase-js';
import type { ZxcvbnResult } from '@zxcvbn-ts/core';
import Link from 'next/link';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiGhostFill, RiMailFill } from 'react-icons/ri';
import { signUpWithPassword } from '../actions';
import { type SignupInput, signupResolver } from '../schemas';

export default function SignupPage() {
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<SignupInput>({
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
    resolver: signupResolver,
  });
  const focusTrapRef = useFocusTrap();
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [username, email, password] = watch(['username', 'email', 'password']);
  const userInputs = useMemo(() => [username, email], [username, email]);
  const deferredPassword = useDeferredValue(password);
  const deferredUserInputs = useDeferredValue(userInputs);
  const [isLoading, setIsLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState(false);
  const handleResult = useCallback(
    (result: ZxcvbnResult | null) => setValue('passwordStrength', result ? result.score : 0),
    [setValue],
  );

  const onSubmit: SubmitHandler<SignupInput> = async (values) => {
    const { username, email } = values;
    setIsLoading(true);
    try {
      const res = await signUpWithPassword(values);
      if (res?.error) throw res.error;
      toast(
        (t) => (
          <EmailToast
            {...t}
            message='Please check your email and click the link to verify your account.'
            emailDomain={email.split('@')[1]}
          />
        ),
        { duration: Number.POSITIVE_INFINITY },
      );
      toast.success(`Account created successfully! Welcome aboard, ${username}!`);
    } catch (e) {
      const { code, message } = e as AuthError;
      if (code === 'username_already_in_use')
        setError('username', { message }, { shouldFocus: true });
      else if (code === 'email_already_in_use')
        setError('email', { message }, { shouldFocus: true });
      else toast.error(`Failed to sign up! ${message}`);
      setIsLoading(false);
    }
  };

  return (
    <Transition ref={focusTrapRef} className='flex min-w-xs max-w-xs flex-col gap-3.5 transition'>
      <Text asChild className='text-2xl'>
        <h3>Create account</h3>
      </Text>
      <Text className='text-sm' dimmed>
        Select method to sign up:
      </Text>
      <SignInMethods
        disabled={isLoading}
        onStart={() => setProviderLoading(true)}
        onError={() => setProviderLoading(false)}
      />
      <Divider label='or continue with email' />
      <form className='flex flex-col gap-3.5' onSubmit={handleSubmit(onSubmit)}>
        <div className='flex flex-col gap-2'>
          <Input
            placeholder='username'
            error={errors.username?.message}
            leftNode={<RiGhostFill />}
            data-autofocus
            {...register('username')}
          />
          <Input
            placeholder='email'
            error={errors.email?.message}
            type='email'
            leftNode={<RiMailFill />}
            {...register('email')}
          />
          <PasswordInput
            error={errors.password?.message}
            visible={visiblePassword}
            onVisibilityChange={setVisiblePassword}
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
          userInputs={deferredUserInputs}
          onResult={handleResult}
        />
        <Button disabled={providerLoading} loading={isLoading} type='submit'>
          sign up
        </Button>
      </form>
      <Text className='text-center text-xs' dimmed>
        Already have an account?{' '}
        <Button
          asChild
          className='inline-flex p-0 text-text text-xs hover:text-main focus-visible:text-main'
          disabled={providerLoading}
          variant='text'
        >
          <Link href='/login'>Sign in</Link>
        </Button>
      </Text>
    </Transition>
  );
}
