import { MainLayout } from '@/components/layout';
import { AuthProvider } from '@/context/authContext';
import { GlobalProvider } from '@/context/globalContext';
import { SettingsProvider } from '@/context/settingsContext';
import { ThemeProvider } from '@/context/themeContext';
import { UserProvider } from '@/context/userContext';
import { lexendDeca } from '@/utils/fonts';
import { STATIC_URL } from '@/utils/monkeytype';
import type { ThemeInfo } from '@/utils/theme';
import type { KeymapLayout } from '@/utils/typingTest';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import './globals.css';

const CommandLine = dynamic(() => import('@/components/command-line/CommandLine'));
const ParallelRouteModal = dynamic(() => import('@/components/layout/ParallelRouteModal'));

export const metadata: Metadata = {
  title: 'Apetype',
  description:
    'Experience the ultimate typing practice platform, Apetype, where customization meets sleek design and a wide range of features. Take on various typing challenges, track your progress, and enhance your typing speed like never before.',
};

async function getLanguages() {
  const res = await fetch(`${STATIC_URL}/languages/_list.json`);
  const languages = (await res.json()) as string[];
  return languages.map((name) => name.replaceAll('_', ' '));
}
async function getLayouts() {
  const res = await fetch(`${STATIC_URL}/layouts/_list.json`);
  const layouts = (await res.json()) as Record<string, KeymapLayout>;
  return layouts;
}
async function getThemes() {
  const res = await fetch(`${STATIC_URL}/themes/_list.json`);
  const themes = (await res.json()) as ThemeInfo[];
  return themes
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name, ...rest }) => ({ name: name.replaceAll('_', ' '), ...rest }));
}

export default async function RootLayout(props: { children: ReactNode; auth: ReactNode }) {
  const [languages, layouts, themes] = await Promise.all([
    getLanguages(),
    getLayouts(),
    getThemes(),
  ]);

  return (
    <html lang='en' className={lexendDeca.variable}>
      <body className='flex justify-center bg-bg font-default transition-colors'>
        <GlobalProvider languages={languages} layouts={layouts} themes={themes}>
          <SettingsProvider>
            <ThemeProvider previewDelay={250} themes={themes}>
              <AuthProvider>
                <UserProvider>
                  <MainLayout>{props.children}</MainLayout>
                  <CommandLine />
                  <ParallelRouteModal
                    routes={['login', 'reset-password', 'signup']}
                    trapFocus={false}
                  >
                    {props.auth}
                  </ParallelRouteModal>
                </UserProvider>
              </AuthProvider>
            </ThemeProvider>
          </SettingsProvider>
        </GlobalProvider>
      </body>
    </html>
  );
}
