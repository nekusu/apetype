'use client';

import { signInWithProvider } from '@/app/@auth/actions';
import { Button } from '@/components/core/Button';
import { Group } from '@/components/core/Group';
import { authMethods } from '@/utils/supabase/auth';
import type { Provider } from '@supabase/supabase-js';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export interface SignInMethodsProps {
  disabled?: boolean;
  onFinish?: () => void;
  onError?: (error: Error) => void;
  onSignIn?: () => void;
  onStart?: () => void;
}

export function SignInMethods({
  disabled,
  onFinish,
  onError,
  onSignIn,
  onStart,
}: SignInMethodsProps) {
  const [providerLoading, setProviderLoading] = useState('');

  const signIn = async (provider: Provider) => {
    const providerName = authMethods.find((method) => method.provider === provider)?.name;
    setProviderLoading(provider);
    try {
      onStart?.();
      const res = await signInWithProvider(provider);
      if (res?.error) throw res.error;
      onSignIn?.();
    } catch (e) {
      const error = e as Error;
      toast.error(`Failed to sign in with ${providerName}! ${error.message}`);
      setProviderLoading('');
      onError?.(error);
    } finally {
      onFinish?.();
    }
  };

  return (
    <Group>
      {authMethods.map(({ name, provider, icon: Icon }) => (
        <Button
          key={name}
          disabled={disabled || (!!providerLoading && providerLoading !== provider)}
          loading={providerLoading === provider}
          onClick={() => signIn(provider)}
        >
          <Icon />
          {name}
        </Button>
      ))}
    </Group>
  );
}
