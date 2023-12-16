'use client';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { useDisclosure, useFocusTrap } from '@mantine/hooks';
import { PasswordInput, SignInMethods } from 'components/auth';
import { Button, Checkbox, Divider, Input, Text, Transition } from 'components/core';
import { FirebaseError } from 'firebase/app';
import Link from 'next/link';
import { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiLoaderLine, RiMailFill } from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';
import { getFirebaseAuth } from 'utils/firebase';
import { Input as ValiInput, boolean, email, minLength, object, string, toTrimmed } from 'valibot';

const loginSchema = object({
  email: string([toTrimmed(), minLength(1, 'Email is required'), email('Invalid email')]),
  password: string([
    minLength(1, 'Password is required'),
    minLength(8, 'Password must have at least 8 characters'),
  ]),
  remember: boolean(),
});
type LoginForm = ValiInput<typeof loginSchema>;

export default function LoginPage() {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    setError,
    setValue,
  } = useForm<LoginForm>({
    defaultValues: { email: '', password: '', remember: true },
    resolver: valibotResolver(loginSchema),
  });
  const focusTrapRef = useFocusTrap();
  const [popupOpen, popupHandler] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<LoginForm> = async ({ email, password, remember }) => {
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
    <Transition
      ref={focusTrapRef}
      className={twJoin([
        'max-w-xs min-w-xs flex flex-col gap-3.5 transition',
        (popupOpen || isLoading) && '!pointer-events-none !opacity-60',
      ])}
    >
      <Text asChild className='text-2xl'>
        <h3>Login</h3>
      </Text>
      <Text className='text-sm' dimmed>
        Select method to log in:
      </Text>
      <SignInMethods onStart={popupHandler.open} onFinish={popupHandler.close} />
      <Divider label='or continue with email' />
      <form className='flex flex-col gap-3.5' onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
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
                className='p-0.5 !rounded-1.5'
                labelClassName='text-sm'
                checked={value}
                setChecked={(value) => setValue('remember', value)}
              />
            )}
          />
          <Button asChild className='p-0 text-xs text-text focus-visible:text-main hover:text-main'>
            <Link href='/reset-password'>Forgot password?</Link>
          </Button>
        </div>
        <Button className='h-9 w-full' variant='filled' type='submit'>
          {isLoading ? <RiLoaderLine className='animate-spin' /> : 'sign in'}
        </Button>
      </form>
      <Text className='text-center text-xs' dimmed>
        Don&apos;t have an account?{' '}
        <Button
          asChild
          className='inline-flex p-0 text-xs text-text focus-visible:text-main hover:text-main'
        >
          <Link href='/signup'>Sign up</Link>
        </Button>
      </Text>
    </Transition>
  );
}
