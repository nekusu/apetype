'use client';

import type { Settings } from '@/utils/settings';
import { readLocalStorageValue } from '@mantine/hooks';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient, isServer, keepPreviousData } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import {
  PersistQueryClientProvider,
  type PersistedClient,
} from '@tanstack/react-query-persist-client';
import { compress, decompress } from 'lz-ts';
import { type ReactNode, useMemo } from 'react';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Number.POSITIVE_INFINITY,
        gcTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
      },
    },
  });
}

const getPersister = (enabled: boolean) =>
  createSyncStoragePersister({
    key: 'ape-cache',
    storage: enabled && !isServer ? localStorage : null,
    serialize: (data) => compress(JSON.stringify(data)),
    deserialize: (data) => JSON.parse(decompress(data)) as PersistedClient,
  });
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  // Server: always make a new query client
  if (isServer) return makeQueryClient();
  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  const settings = readLocalStorageValue<Settings | undefined>({ key: 'settings' });
  const { persistentCache = true } = settings ?? {};
  const persister = useMemo(() => getPersister(persistentCache), [persistentCache]);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: Number.POSITIVE_INFINITY,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.state.status === 'success' && !query.meta?.disablePersister,
        },
      }}
    >
      {children}
      <ReactQueryDevtools />
    </PersistQueryClientProvider>
  );
}
