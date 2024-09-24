'use client';

import { PasswordInput } from '@/components/auth/PasswordInput';
import { SignInMethods } from '@/components/auth/SignInMethods';
import { Button } from '@/components/core/Button';
import { Divider } from '@/components/core/Divider';
import { Input } from '@/components/core/Input';
import { Text } from '@/components/core/Text';
import { Transition } from '@/components/core/Transition';
import { useFocusTrap } from '@mantine/hooks';
import type { AuthError } from '@supabase/supabase-js';
import Link from 'next/link';
import { useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiMailFill } from 'react-icons/ri';
import { is } from 'valibot';
import { signInWithPassword } from '../actions';
import { EmailSchema, type LoginInput, loginResolver } from '../schemas';

export default function LoginPage() {
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
    watch,
  } = useForm<LoginInput>({
    defaultValues: { email: '', password: '' },
    resolver: loginResolver,
  });
  const email = watch('email');
  const focusTrapRef = useFocusTrap();
  const [isLoading, setIsLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState(false);

  const onSubmit: SubmitHandler<LoginInput> = async (values) => {
    setIsLoading(true);
    try {
      const res = await signInWithPassword(values);
      if (res?.error) throw res.error;
      toast.success(`Welcome back! You're now logged in.`);
    } catch (e) {
      const { code, message } = e as AuthError;
      if (code === 'invalid_credentials')
        setError('email', { message: 'Account not found' }, { shouldFocus: true });
      else if (code === 'wrong_password') setError('password', { message }, { shouldFocus: true });
      else toast.error(`Failed to log in! ${message}`);
      setIsLoading(false);
    }
  };

  return (
    <Transition ref={focusTrapRef} className='flex min-w-xs max-w-xs flex-col gap-3.5 transition'>
      <Text asChild className='text-2xl'>
        <h3>Login</h3>
      </Text>
      <Text className='text-sm' dimmed>
        Select method to log in:
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
            placeholder='email'
            error={errors.email?.message}
            type='email'
            leftNode={<RiMailFill />}
            data-autofocus
            {...register('email')}
          />
          <PasswordInput error={errors.password?.message} {...register('password')} />
        </div>
        <Button
          asChild
          className='ml-auto p-0 text-text text-xs hover:text-main focus-visible:text-main'
          disabled={providerLoading}
          variant='text'
        >
          <Link href={`/reset-password${is(EmailSchema, email) ? `?email=${email}` : ''}`}>
            Forgot password?
          </Link>
        </Button>
        <Button disabled={providerLoading} loading={isLoading} type='submit'>
          sign in
        </Button>
      </form>
      <Text className='text-center text-xs' dimmed>
        Don't have an account?{' '}
        <Button
          asChild
          className='inline-flex p-0 text-text text-xs hover:text-main focus-visible:text-main'
          disabled={providerLoading}
          variant='text'
        >
          <Link href='/signup'>Sign up</Link>
        </Button>
      </Text>
    </Transition>
  );
}
