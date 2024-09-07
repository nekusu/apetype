'use client';

import { EmailToast, PasswordInput, PasswordStrength, SignInMethods } from '@/components/auth';
import { Button, Divider, Input, Text, Transition } from '@/components/core';
import { getFirebaseAuth, getFirebaseFirestore } from '@/utils/firebase';
import { type User, defaultUserDetails } from '@/utils/user';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { useDisclosure, useFocusTrap } from '@mantine/hooks';
import type { ZxcvbnResult } from '@zxcvbn-ts/core';
import type { FirebaseError } from 'firebase/app';
import Link from 'next/link';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiMailFill, RiUser4Fill } from 'react-icons/ri';
import {
  type InferInput,
  check,
  email,
  forward,
  maxLength,
  minLength,
  nonEmpty,
  number,
  object,
  pipe,
  regex,
  string,
  trim,
} from 'valibot';

const SignupSchema = pipe(
  object({
    username: pipe(
      string(),
      nonEmpty('Username is required'),
      minLength(3, 'Username must have at least 3 characters'),
      maxLength(32, 'Username must have at most 32 characters'),
      regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    ),
    email: pipe(string(), trim(), nonEmpty('Email is required'), email('Invalid email')),
    password: pipe(
      string(),
      nonEmpty('Password is required'),
      minLength(8, 'Password must have at least 8 characters'),
    ),
    confirmPassword: pipe(string(), nonEmpty('Password confirmation is required')),
    passwordStrength: number(),
  }),
  forward(
    check(
      ({ password, confirmPassword }) => password === confirmPassword,
      'Passwords do not match',
    ),
    ['confirmPassword'],
  ),
  forward(
    check(({ passwordStrength }) => passwordStrength >= 2, 'Password is too weak'),
    ['password'],
  ),
);
type SignupInput = InferInput<typeof SignupSchema>;

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
    resolver: valibotResolver(SignupSchema),
  });
  const focusTrapRef = useFocusTrap();
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [username, email, password] = watch(['username', 'email', 'password']);
  const userInputs = useMemo(() => [username, email], [username, email]);
  const deferredPassword = useDeferredValue(password);
  const deferredUserInputs = useDeferredValue(userInputs);
  const [popupOpened, popupHandler] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleResult = useCallback(
    (result: ZxcvbnResult | null) => setValue('passwordStrength', result ? result.score : 0),
    [setValue],
  );

  const onSubmit: SubmitHandler<SignupInput> = async ({ username, email, password }) => {
    const [
      { auth, createUserWithEmailAndPassword, sendEmailVerification, updateProfile },
      { getDocuments, serverTimestamp, setDocument, where },
    ] = await Promise.all([getFirebaseAuth(), getFirebaseFirestore()]);
    try {
      setIsLoading(true);
      const usersWithSameName = await getDocuments<User>('users', where('name', '==', username));
      if (usersWithSameName.size > 0) {
        setError('username', { message: 'Username is already taken' }, { shouldFocus: true });
        return;
      }
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDocument<User>('users', user.uid, {
        name: username,
        joinedAt: serverTimestamp(),
        ...defaultUserDetails,
      });
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: username });
        await sendEmailVerification(auth.currentUser);
      }
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
      toast.success(`Account created successfully! Welcome aboard, ${user.displayName}!`);
    } catch (e) {
      const error = e as FirebaseError;
      if (error.code === 'auth/email-already-in-use')
        setError('email', { message: 'Email is already in use' }, { shouldFocus: true });
      else toast.error(`Something went wrong! ${error.message}`);
    } finally {
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
        onStart={popupHandler.open}
        onFinish={popupHandler.close}
      />
      <Divider label='or continue with email' />
      <form className='flex flex-col gap-3.5' onSubmit={handleSubmit(onSubmit)}>
        <div className='flex flex-col gap-2'>
          <Input
            placeholder='username'
            error={errors.username?.message}
            leftNode={<RiUser4Fill />}
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
        <Button disabled={popupOpened} loading={isLoading} type='submit'>
          sign up
        </Button>
      </form>
      <Text className='text-center text-xs' dimmed>
        Already have an account?{' '}
        <Button
          asChild
          className='inline-flex p-0 text-text text-xs hover:text-main focus-visible:text-main'
          variant='text'
        >
          <Link href='/login'>Sign in</Link>
        </Button>
      </Text>
    </Transition>
  );
}
