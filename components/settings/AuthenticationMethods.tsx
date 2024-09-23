'use client';

import { Button } from '@/components/core/Button';
import { getUserIdentities } from '@/queries/get-user-identities';
import { authMethods } from '@/utils/supabase/auth';
import supabase from '@/utils/supabase/browser';
import type { Provider, UserIdentity } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Setting } from './Setting';

export function AuthenticationMethods() {
  const { data: identities, error, refetch } = useQuery(getUserIdentities(supabase));
  const [providerLoading, setProviderLoading] = useState('');

  const handleMethod = async (
    params: { type: 'link'; provider: Provider } | { type: 'unlink'; identity: UserIdentity },
  ) => {
    const provider = params.type === 'link' ? params.provider : params.identity.provider;
    const providerName = authMethods.find((method) => method.provider === provider)?.name;
    setProviderLoading(provider);
    try {
      const { error } = await (params.type === 'link'
        ? supabase.auth.linkIdentity({
            provider: params.provider,
            options: { redirectTo: `${location.origin}/auth/callback` },
          })
        : supabase.auth.unlinkIdentity(params.identity));
      if (error) throw error;
      await refetch();
      if (params.type === 'unlink')
        toast.success(`Account unlinked from ${providerName} successfully!`);
    } catch (e) {
      toast.error(`Failed to ${params.type} account! ${(e as Error).message}`);
    } finally {
      setProviderLoading('');
    }
  };

  useEffect(() => {
    if (error) toast.error(`Failed to get user identities! ${error.message}`);
  }, [error]);

  return (
    <Setting id='authenticationMethods'>
      {authMethods.map(({ provider }) => {
        const identity = identities?.find((identity) => identity.provider === provider);
        const isProviderLinked = !!identity;
        return (
          <Button
            key={provider}
            disabled={!!providerLoading && providerLoading !== provider}
            loading={providerLoading === provider}
            onClick={() =>
              identity
                ? handleMethod({ type: 'unlink', identity })
                : handleMethod({ type: 'link', provider })
            }
            variant={isProviderLinked ? 'danger' : 'filled'}
          >
            {isProviderLinked && 'un'}link {provider}
          </Button>
        );
      })}
    </Setting>
  );
}
