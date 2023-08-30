'use client';

import { Button } from 'components/core';
import { FirebaseError } from 'firebase/app';
import { AuthProvider, UserInfo } from 'firebase/auth';
import { useDidMount } from 'hooks/useDidMount';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { RiLoaderLine } from 'react-icons/ri';
import { getFirebaseAuth } from 'utils/firebase';
import { AuthenticationMethod } from 'utils/firebase/auth';
import Setting from './Setting';

export default function AuthenticationMethods() {
  const [providerLoading, setProviderLoading] = useState('');
  const [userProviders, setUserProviders] = useState<UserInfo[]>();
  const [authMethods, setAuthMethods] = useState<AuthenticationMethod[]>();

  const handleMethod = async (
    providerName: string,
    provider: AuthProvider,
    type: 'link' | 'unlink',
  ) => {
    const { auth, linkWithPopup, unlink } = await getFirebaseAuth();
    if (!auth.currentUser) return;
    try {
      setProviderLoading(providerName);
      if (type === 'link') await linkWithPopup(auth.currentUser, provider);
      else await unlink(auth.currentUser, provider.providerId);
      toast.success(
        `Account ${type === 'link' ? 'linked to' : 'unlinked from'} ${providerName} successfully!`,
      );
      setUserProviders(auth.currentUser.providerData);
    } catch (e) {
      toast.error(`Something went wrong! ${(e as FirebaseError).message}`);
    } finally {
      setProviderLoading('');
    }
  };

  useDidMount(() => {
    void (async () => {
      const { auth, authenticationMethods } = await getFirebaseAuth();
      setUserProviders(auth.currentUser?.providerData);
      setAuthMethods(authenticationMethods);
    })();
  });

  return (
    <Setting id='authenticationMethods'>
      {authMethods?.map(({ name, provider }) => {
        const isProviderLinked = userProviders?.some(
          ({ providerId }) => providerId === provider.providerId,
        );
        return (
          <Button
            key={name}
            className='w-full'
            disabled={!!providerLoading}
            variant={isProviderLinked ? 'danger' : 'filled'}
            onClick={() => void handleMethod(name, provider, isProviderLinked ? 'unlink' : 'link')}
          >
            {providerLoading === name ? (
              <RiLoaderLine className='animate-spin' />
            ) : (
              <>
                {isProviderLinked && 'un'}link {name.toLowerCase()}
              </>
            )}
          </Button>
        );
      })}
    </Setting>
  );
}
