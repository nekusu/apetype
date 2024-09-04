'use client';

import { Button } from '@/components/core';
import { useDidMount } from '@/hooks/useDidMount';
import { getFirebaseAuth, getFirebaseFirestore } from '@/utils/firebase';
import type { AuthenticationMethod } from '@/utils/firebase/auth';
import { type User, defaultUserDetails } from '@/utils/user';
import type { FirebaseError } from 'firebase/app';
import type { AuthProvider, UserCredential } from 'firebase/auth';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';

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
  const [authMethods, setAuthMethods] = useState<AuthenticationMethod[]>();

  const signIn = useCallback(
    async (provider: AuthProvider) => {
      const [
        { auth, getAdditionalUserInfo, signInWithPopup, updateProfile },
        { getDocuments, serverTimestamp, setDocument, where },
      ] = await Promise.all([getFirebaseAuth(), getFirebaseFirestore()]);
      try {
        onStart?.();
        const result = await signInWithPopup(auth, provider);
        const userInfo = getAdditionalUserInfo(result);
        const { user } = result;
        let toastMessage = `Welcome back, ${user.displayName}! You're now logged in.`;
        if (userInfo?.isNewUser) {
          const usersWithSameName = await getDocuments<User>(
            'users',
            where('name', '==', user.displayName),
          );
          const username = `${user.displayName}${usersWithSameName.size || ''}`;
          toastMessage = `Account created successfully! Welcome aboard, ${username}!`;
          if (usersWithSameName.size > 0) await updateProfile(user, { displayName: username });
          await setDocument<User>('users', user.uid, {
            name: username,
            joinedAt: serverTimestamp(),
            profilePicture: { url: user.photoURL?.replace('s96-c', 's500-c') ?? '' },
            ...defaultUserDetails,
          });
        }
        toast.success(toastMessage);
        onSignIn?.(result);
      } catch (e) {
        const error = e as FirebaseError;
        toast.error(`Something went wrong! ${error.message}`);
        onError?.(error);
      } finally {
        onFinish?.();
      }
    },
    [onError, onFinish, onSignIn, onStart],
  );

  useDidMount(() => {
    void (async () => {
      const { authenticationMethods } = await getFirebaseAuth();
      setAuthMethods(authenticationMethods);
    })();
  });

  return (
    <div className='flex gap-2'>
      {authMethods?.map(({ name, provider, Icon }) => (
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
