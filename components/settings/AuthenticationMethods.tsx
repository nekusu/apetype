'use client';

import { useForceUpdate } from '@mantine/hooks';
import { Button } from 'components/core';
import { FirebaseError } from 'firebase/app';
import { AuthProvider, linkWithPopup, unlink } from 'firebase/auth';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { RiLoaderLine } from 'react-icons/ri';
import { auth, authenticationMethods } from 'utils/firebase';
import Setting from './Setting';

export default function AuthenticationMethods() {
  const forceUpdate = useForceUpdate();
  const [providerLoading, setProviderLoading] = useState('');
  const userProviders = auth.currentUser?.providerData;

  const handleMethod = async (
    providerName: string,
    provider: AuthProvider,
    type: 'link' | 'unlink',
  ) => {
    if (!auth.currentUser) return;
    try {
      setProviderLoading(providerName);
      if (type === 'link') await linkWithPopup(auth.currentUser, provider);
      else await unlink(auth.currentUser, provider.providerId);
      toast.success(
        `Account ${type === 'link' ? 'linked to' : 'unlinked from'} ${providerName} successfully!`,
      );
      forceUpdate();
    } catch (e) {
      toast.error(`Something went wrong! ${(e as FirebaseError).message}`);
    } finally {
      setProviderLoading('');
    }
  };

  return (
    <Setting id='authenticationMethods'>
      {authenticationMethods.map(({ name, provider }) => {
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
