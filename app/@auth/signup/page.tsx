'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useDidUpdate, useDisclosure, useFocusTrap } from '@mantine/hooks';
import { ZxcvbnResult } from '@zxcvbn-ts/core';
import { EmailToast, PasswordInput, PasswordStrength, SignInMethods } from 'components/auth';
import { Button, Divider, Input, Text, Transition } from 'components/core';
import { User, defaultUserDetails } from 'context/userContext';
import { FirebaseError } from 'firebase/app';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiLoaderLine, RiMailFill, RiUser4Fill } from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';
import { getFirebaseAuth, getFirebaseFirestore } from 'utils/firebase';
import { z } from 'zod';

const formSchema = z
  .object({
    username: z
      .string()
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
      .min(1, 'Username is required')
      .min(3, 'Username must have at least 3 characters')
      .max(20, 'Username must have at most 20 characters'),
    email: z.string().trim().email('Invalid email').min(1, 'Email is required'),
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

export default function Signup() {
  const router = useRouter();
  const [passwordStrength, setPasswordStrength] = useState<ZxcvbnResult | null>(null);
  const {
    formState: { isSubmitted, errors },
    handleSubmit,
    register,
    setError,
    trigger,
    watch,
  } = useForm<FormValues>({
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
    resolver: zodResolver(
      formSchema.refine(() => passwordStrength && passwordStrength.score >= 2, {
        path: ['password'],
        message: 'Password is too weak',
      }),
    ),
    reValidateMode: 'onSubmit',
  });
  const focusTrapRef = useFocusTrap();
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [username, email, password, confirmPassword] = watch([
    'username',
    'email',
    'password',
    'confirmPassword',
  ]);
  const userInputs = useMemo(() => [username, email], [username, email]);
  const deferredPassword = useDeferredValue(password);
  const deferredUserInputs = useDeferredValue(userInputs);
  const [popupOpen, popupHandler] = useDisclosure(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleResult = useCallback((result: ZxcvbnResult) => setPasswordStrength(result), []);

  const onSubmit: SubmitHandler<FormValues> = async ({ username, email, password }) => {
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
        { duration: Infinity },
      );
      toast.success(`Account created successfully! Welcome aboard, ${user.displayName}!`);
      router.push('/');
    } catch (e) {
      const error = e as FirebaseError;
      if (error.code === 'auth/email-already-in-use')
        setError('email', { message: 'Email is already in use' }, { shouldFocus: true });
      else toast.error(`Something went wrong! ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useDidUpdate(() => {
    if (isSubmitted) void trigger();
  }, [passwordStrength, confirmPassword]);

  return (
    <Transition
      ref={focusTrapRef}
      className={twJoin([
        'max-w-xs min-w-xs flex flex-col gap-3.5 transition',
        (popupOpen || isLoading) && '!pointer-events-none !opacity-60',
      ])}
    >
      <Text asChild className='text-2xl'>
        <h3>Create account</h3>
      </Text>
      <Text className='text-sm' dimmed>
        Select method to sign up:
      </Text>
      <SignInMethods
        onStart={popupHandler.open}
        onSignIn={() => router.push('/')}
        onFinish={popupHandler.close}
      />
      <Divider label='or continue with email' />
      <form className='flex flex-col gap-3.5' onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
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
        <Button className='h-9 w-full' variant='filled' type='submit'>
          {isLoading ? <RiLoaderLine className='animate-spin' /> : 'sign up'}
        </Button>
      </form>
      <Text className='text-center text-xs' dimmed>
        Already have an account?{' '}
        <Button
          asChild
          className='inline-flex p-0 text-xs text-text focus-visible:text-main hover:text-main'
        >
          <Link href='/login'>Sign in</Link>
        </Button>
      </Text>
    </Transition>
  );
}
