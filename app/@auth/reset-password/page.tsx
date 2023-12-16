'use client';

import { valibotResolver } from '@hookform/resolvers/valibot';
import { useFocusTrap } from '@mantine/hooks';
import { EmailToast } from 'components/auth';
import { Button, Input, Text, Transition } from 'components/core';
import { FirebaseError } from 'firebase/app';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { RiLoaderLine, RiMailFill } from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';
import { getFirebaseAuth } from 'utils/firebase';
import { Input as ValiInput, email, minLength, object, string, toTrimmed } from 'valibot';

const resetPasswordSchema = object({
  email: string([toTrimmed(), minLength(1, 'Email is required'), email('Invalid email')]),
});
type ResetPasswordForm = ValiInput<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const {
    formState: { errors },
    handleSubmit,
    register,
    setError,
  } = useForm<ResetPasswordForm>({
    defaultValues: { email: '' },
    resolver: valibotResolver(resetPasswordSchema),
  });
  const focusTrapRef = useFocusTrap();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<ResetPasswordForm> = async ({ email }) => {
    const { auth, sendPasswordResetEmail } = await getFirebaseAuth();
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email);
      toast(
        (t) => (
          <EmailToast
            {...t}
            message='Please check your email and click the link to reset your password.'
            emailDomain={email.split('@')[1]}
          />
        ),
        { duration: Infinity },
      );
      router.push('/login');
    } catch (e) {
      const error = e as FirebaseError;
      if (error.code === 'auth/user-not-found')
        setError('email', { message: 'Account not found' }, { shouldFocus: true });
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
        isLoading && '!pointer-events-none !opacity-60',
      ])}
    >
      <Text asChild className='text-2xl'>
        <h3>Reset password</h3>
      </Text>
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
        </div>
        <Button className='h-9 w-full' variant='filled' type='submit'>
          {isLoading ? <RiLoaderLine className='animate-spin' /> : 'send email'}
        </Button>
      </form>
    </Transition>
  );
}
