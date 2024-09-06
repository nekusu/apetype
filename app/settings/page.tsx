'use client';

import { Button, Text, Transition } from '@/components/core';
import {
  FontFamily,
  ImportExportSettings,
  PersistentCache,
  ResetSettings,
  Setting,
  SoundOnClick,
  Theme,
} from '@/components/settings';
import { useAuth } from '@/context/authContext';
import { useGlobal } from '@/context/globalContext';
import { useUser } from '@/context/userContext';
import { replaceSpaces } from '@/utils/misc';
import { categories, type settingsList } from '@/utils/settings';
import { m } from 'framer-motion';
import dynamic from 'next/dynamic';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { twJoin } from 'tailwind-merge';

const AuthenticationMethods = dynamic(() => import('@/components/settings/AuthenticationMethods'));
const PasswordAuthentication = dynamic(
  () => import('@/components/settings/PasswordAuthentication'),
);
const ResetPersonalBests = dynamic(() => import('@/components/settings/ResetPersonalBests'));
const ResetAccount = dynamic(() => import('@/components/settings/ResetAccount'));
const DeleteAccount = dynamic(() => import('@/components/settings/DeleteAccount'));

type SettingsList = typeof settingsList;
type Category = (typeof categories)[number];

export default function SettingsPage() {
  const { settingsList } = useGlobal();
  const { signedIn } = useAuth();
  const { user } = useUser();
  const settingsListEntries = useMemo(
    () =>
      Object.entries(settingsList).filter(([, { hidden }]) => !hidden) as [
        keyof SettingsList,
        SettingsList[keyof SettingsList],
      ][],
    [settingsList],
  );
  const customComponents: Partial<Record<keyof SettingsList, ReactNode>> = useMemo(
    () => ({
      soundOnClick: <SoundOnClick key='soundOnClick' />,
      fontFamily: <FontFamily key='fontFamily' />,
      theme: <Theme key='theme' />,
      importExportSettings: <ImportExportSettings key='importExportSettings' />,
      resetSettings: <ResetSettings key='resetSettings' />,
      persistentCache: <PersistentCache key='persistentCache' />,
      authenticationMethods: (signedIn || user) && (
        <AuthenticationMethods key='authenticationMethods' />
      ),
      passwordAuthentication: (signedIn || user) && (
        <PasswordAuthentication key='passwordAuthentication' />
      ),
      resetPersonalBests: (signedIn || user) && <ResetPersonalBests key='resetPersonalBests' />,
      resetAccount: (signedIn || user) && <ResetAccount key='resetAccount' />,
      deleteAccount: (signedIn || user) && <DeleteAccount key='deleteAccount' />,
    }),
    [signedIn, user],
  );
  const settingsComponents = useMemo(() => {
    const components = settingsListEntries.reduce(
      (components, [id]) => {
        if (!customComponents[id]) components[id] = <Setting key={id} id={id} />;
        return components;
      },
      {} as Record<keyof SettingsList, ReactNode>,
    );
    return { ...components, ...customComponents };
  }, [customComponents, settingsListEntries]);
  const [currentCategory, setCurrentCategory] = useState<Category>(categories[0]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { isIntersecting, target } of entries)
          if (isIntersecting) {
            setCurrentCategory(target.id.replace(/_/g, ' ') as Category);
            break;
          }
      },
      { root: listRef.current, rootMargin: '-180px 0px -90%' },
    );
    if (listRef.current) for (const child of listRef.current.children) observer.observe(child);
    return () => observer.disconnect();
  }, []);

  return (
    <Transition className='relative cursor-default'>
      <div className='absolute inset-0 flex h-full'>
        <nav className='flex min-w-40 shrink-0 flex-col items-start gap-2 overflow-y-auto overflow-x-hidden py-0.5'>
          {categories.map((category) => (
            <Button
              key={category}
              className={twJoin(
                'group relative px-0 py-1.5 transition-all',
                category === 'danger zone' && 'hover:text-error',
                currentCategory === category &&
                  'px-2.5 text-bg hover:text-bg focus-visible:text-bg',
              )}
              onClick={() =>
                document
                  .getElementById(replaceSpaces(category))
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
              variant='text'
            >
              {currentCategory === category && (
                <m.div
                  className={twJoin(
                    '-z-10 absolute inset-0 transition-colors group-hover:bg-text group-focus-visible:bg-text',
                    currentCategory === 'danger zone' ? 'bg-error' : 'bg-main',
                  )}
                  layoutId='navigation-box'
                  style={{ borderRadius: 8 }}
                  transition={{ duration: 0.15 }}
                />
              )}
              {category}
            </Button>
          ))}
        </nav>
        <main className='flex max-h-full flex-col gap-10 overflow-auto pb-2' ref={listRef}>
          {categories.map((category) => (
            <section key={category} className='flex flex-col gap-6' id={replaceSpaces(category)}>
              <Text
                asChild
                className={twJoin(
                  '-mb-1 pt-1 text-[28px] leading-none',
                  category === 'danger zone' ? 'text-error' : 'text-main',
                )}
              >
                <h2>{category}</h2>
              </Text>
              {settingsListEntries
                .filter(([, setting]) => setting.category === category)
                .map(([id]) => settingsComponents[id])}
            </section>
          ))}
        </main>
      </div>
    </Transition>
  );
}
