'use client';

import { PasswordInput, SignInMethods } from '@/components/auth';
import { Button, Checkbox, Divider, Input, Text, Transition } from '@/components/core';
import { getFirebaseAuth } from '@/utils/firebase';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { useDisclosure, useFocusTrap } from '@mantine/hooks';
import type { FirebaseError } from 'firebase/app';
import Link from 'next/link';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiMailFill } from 'react-icons/ri';
import {
  type InferInput,
  boolean,
  email,
  minLength,
  nonEmpty,
  object,
  pipe,
  string,
  trim,
} from 'valibot';

const LoginSchema = object({
  email: pipe(string(), trim(), nonEmpty('Email is required'), email('Invalid email')),
  password: pipe(
    string(),
    nonEmpty('Password is required'),
    minLength(8, 'Password must have at least 8 characters'),
  ),
  remember: boolean(),
});
type LoginInput = InferInput<typeof LoginSchema>;

export default function LoginPage() {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm<LoginInput>({
    defaultValues: { email: '', password: '', remember: true },
    resolver: valibotResolver(LoginSchema),
  });
  const focusTrapRef = useFocusTrap();
  const [popupOpened, popupHandler] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<LoginInput> = async ({ email, password, remember }) => {
    const {
      auth,
      browserLocalPersistence,
      browserSessionPersistence,
      setPersistence,
      signInWithEmailAndPassword,
    } = await getFirebaseAuth();
    try {
      setIsLoading(true);
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      toast.success(`Welcome back, ${user.displayName}! You're now logged in.`);
    } catch (e) {
      const error = e as FirebaseError;
      if (error.code === 'auth/user-not-found')
        setError('email', { message: 'Account not found' }, { shouldFocus: true });
      else if (error.code === 'auth/wrong-password')
        setError('password', { message: 'Wrong password' }, { shouldFocus: true });
      else toast.error(`Something went wrong! ${error.message}`);
    } finally {
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
        onStart={popupHandler.open}
        onFinish={popupHandler.close}
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
        <div className='flex justify-between gap-2'>
          <Controller
            control={control}
            name='remember'
            render={({ field: { value } }) => (
              <Checkbox
                label='Remember me'
                className='!rounded-[6px] p-0.5'
                labelClassName='text-sm'
                checked={value}
                setChecked={(value) => setValue('remember', value)}
              />
            )}
          />
          <Button
            asChild
            className='p-0 text-text text-xs hover:text-main focus-visible:text-main'
            variant='text'
          >
            <Link href='/reset-password'>Forgot password?</Link>
          </Button>
        </div>
        <Button disabled={popupOpened} loading={isLoading} type='submit'>
          sign in
        </Button>
      </form>
      <Text className='text-center text-xs' dimmed>
        Don't have an account?{' '}
        <Button
          asChild
          className='inline-flex p-0 text-text text-xs hover:text-main focus-visible:text-main'
          variant='text'
        >
          <Link href='/signup'>Sign up</Link>
        </Button>
      </Text>
    </Transition>
  );
}
