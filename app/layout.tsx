import { MainLayout } from '@/components/layout/MainLayout';
import { GlobalProvider } from '@/context/globalContext';
import { QueryProvider } from '@/context/queryContext';
import { SettingsProvider } from '@/context/settingsContext';
import { ThemeProvider } from '@/context/themeContext';
import { UserProvider } from '@/context/userContext';
import { cachedLanguageListOptions } from '@/queries/get-language-list';
import { cachedLayoutListOptions } from '@/queries/get-layout-list';
import { cachedThemeOptions } from '@/queries/get-theme';
import { cachedThemeListOptions } from '@/queries/get-theme-list';
import { getUserById } from '@/queries/get-user-by-id';
import { lexendDeca } from '@/utils/fonts';
import { createClient } from '@/utils/supabase/server';
import { type ThemeColors, themeColorVariables } from '@/utils/theme';
import { prefetchQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { mapKeys } from 'radashi';
import type { ReactNode } from 'react';
import './globals.css';

const CommandLine = dynamic(() => import('@/components/core/CommandLine'));
const ParallelRouteModal = dynamic(() =>
  import('@/components/layout/ParallelRouteModal').then(
    ({ ParallelRouteModal }) => ParallelRouteModal,
  ),
);

export const metadata: Metadata = {
  title: 'Apetype',
  description:
    'Experience the ultimate typing practice platform, Apetype, where customization meets sleek design and a wide range of features. Take on various typing challenges, track your progress, and enhance your typing speed like never before.',
};

export default async function RootLayout(props: { children: ReactNode; auth: ReactNode }) {
  const queryClient = new QueryClient();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const queries: [Promise<ThemeColors>, ...Promise<void>[]] = [
    queryClient.fetchQuery(cachedThemeOptions('aurora')),
    queryClient.prefetchQuery(cachedLanguageListOptions),
    queryClient.prefetchQuery(cachedLayoutListOptions),
    queryClient.prefetchQuery(cachedThemeListOptions),
  ];
  if (user) queries.push(prefetchQuery(queryClient, getUserById(supabase, user.id)));
  const [defaultTheme] = await Promise.all(queries);

  return (
    <html
      lang='en'
      className={lexendDeca.variable}
      style={mapKeys(defaultTheme, (key) => themeColorVariables[key])}
    >
      <body className='flex justify-center bg-bg font-default transition-colors'>
        <QueryProvider>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <GlobalProvider>
              <SettingsProvider>
                <ThemeProvider previewDelay={250}>
                  <UserProvider id={user?.id}>
                    <MainLayout>{props.children}</MainLayout>
                    <CommandLine />
                    <ParallelRouteModal
                      routes={['login', 'reset-password', 'signup']}
                      trapFocus={false}
                    >
                      {props.auth}
                    </ParallelRouteModal>
                  </UserProvider>
                </ThemeProvider>
              </SettingsProvider>
            </GlobalProvider>
          </HydrationBoundary>
        </QueryProvider>
      </body>
    </html>
  );
}
