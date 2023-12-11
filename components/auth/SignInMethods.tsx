'use client';

import { Button } from 'components/core';
import { FirebaseError } from 'firebase/app';
import { AuthProvider, UserCredential } from 'firebase/auth';
import { useDidMount } from 'hooks/useDidMount';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { getFirebaseAuth, getFirebaseFirestore } from 'utils/firebase';
import { AuthenticationMethod } from 'utils/firebase/auth';
import { User, defaultUserDetails } from 'utils/user';

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
      const [{ auth, getAdditionalUserInfo, signInWithPopup }, { setDocument, serverTimestamp }] =
        await Promise.all([getFirebaseAuth(), getFirebaseFirestore()]);
      try {
        onStart?.();
        const result = await signInWithPopup(auth, provider);
        const userInfo = getAdditionalUserInfo(result);
        const { user } = result;
        let toastMessage = `Welcome back, ${user.displayName}! You're now logged in.`;
        if (userInfo?.isNewUser) {
          toastMessage = `Account created successfully! Welcome aboard, ${user.displayName}!`;
          await setDocument<User>('users', user.uid, {
            name: user.displayName as string,
            joinedAt: serverTimestamp(),
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
