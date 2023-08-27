'use client';

import { Button } from 'components/core';
import { FirebaseError } from 'firebase/app';
import {
  AuthProvider,
  UserCredential,
  getAdditionalUserInfo,
  signInWithPopup,
} from 'firebase/auth';
import { serverTimestamp } from 'firebase/firestore';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { addDocument, auth, authenticationMethods } from 'utils/firebase';

export interface SignInMethodsProps {
  onFinish?: () => void;
  onError?: (error: FirebaseError) => void;
  onSignIn?: (result: UserCredential) => void;
  onStart?: () => void;
}

export default function SignInMethods({
  onFinish,
  onError,
  onSignIn,
  onStart,
}: SignInMethodsProps) {
  const signIn = useCallback(
    async (provider: AuthProvider) => {
      try {
        onStart?.();
        const result = await signInWithPopup(auth, provider);
        const userInfo = getAdditionalUserInfo(result);
        const { user } = result;
        let toastMessage = `Welcome back, ${user.displayName}! You're now logged in.`;
        if (userInfo?.isNewUser) {
          toastMessage = `Account created successfully! Welcome aboard, ${user.displayName}!`;
          await addDocument(
            'users',
            { name: user.displayName, joinedAt: serverTimestamp() },
            user.uid,
          );
        }
        toast.success(toastMessage);
        onSignIn?.(result);
      } catch (e) {
        toast.error(`Something went wrong! ${(e as FirebaseError).message}`);
        onError?.(e as FirebaseError);
      } finally {
        onFinish?.();
      }
    },
    [onError, onFinish, onSignIn, onStart],
  );

  return (
    <div className='flex gap-2'>
      {authenticationMethods.map(({ name, provider, Icon }) => (
        <Button
          key={name}
          className='w-full'
          variant='filled'
          onClick={() => void signIn(provider)}
        >
          <Icon />
          {name}
        </Button>
      ))}
    </div>
  );
}
