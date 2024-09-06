'use client';

import { Button } from '@/components/core';
import { useAuth } from '@/context/authContext';
import { useDidMount } from '@/hooks/useDidMount';
import { getFirebaseAuth } from '@/utils/firebase';
import type { AuthenticationMethod } from '@/utils/firebase/auth';
import type { FirebaseError } from 'firebase/app';
import type { AuthProvider } from 'firebase/auth';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Setting from './Setting';

export default function AuthenticationMethods() {
  const { currentUser } = useAuth();
  const [providerLoading, setProviderLoading] = useState('');
  const [authMethods, setAuthMethods] = useState<AuthenticationMethod[]>();

  const handleMethod = async (
    providerName: string,
    provider: AuthProvider,
    type: 'link' | 'unlink',
  ) => {
    const { linkWithPopup, unlink } = await getFirebaseAuth();
    if (!currentUser) return;
    try {
      setProviderLoading(providerName);
      if (type === 'link') await linkWithPopup(currentUser, provider);
      else await unlink(currentUser, provider.providerId);
      toast.success(
        `Account ${type === 'link' ? 'linked to' : 'unlinked from'} ${providerName} successfully!`,
      );
    } catch (e) {
      toast.error(`Something went wrong! ${(e as FirebaseError).message}`);
    } finally {
      setProviderLoading('');
    }
  };

  useDidMount(() => {
    (async () => {
      const { authenticationMethods } = await getFirebaseAuth();
      setAuthMethods(authenticationMethods);
    })();
  });

  return (
    <Setting id='authenticationMethods'>
      {authMethods?.map(({ name, provider }) => {
        const isProviderLinked = currentUser?.providerData.some(
          ({ providerId }) => providerId === provider.providerId,
        );
        return (
          <Button
            key={name}
            disabled={!!providerLoading}
            loading={providerLoading === name}
            onClick={() => handleMethod(name, provider, isProviderLinked ? 'unlink' : 'link')}
            variant={isProviderLinked ? 'danger' : 'filled'}
          >
            {isProviderLinked && 'un'}link {name.toLowerCase()}
          </Button>
        );
      })}
    </Setting>
  );
}
