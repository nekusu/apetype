'use client';

import { Button, Text, Transition } from 'components/core';
import {
  FontFamily,
  ImportExportSettings,
  PersistentCache,
  ResetSettings,
  Setting,
  SoundOnClick,
  Theme,
} from 'components/settings';
import { useGlobal } from 'context/globalContext';
import { useUser } from 'context/userContext';
import { m } from 'framer-motion';
import dynamic from 'next/dynamic';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { twJoin } from 'tailwind-merge';
import { replaceSpaces } from 'utils/misc';
import { categories, settingsList } from 'utils/settings';

const AuthenticationMethods = dynamic(() => import('components/settings/AuthenticationMethods'));
const PasswordAuthentication = dynamic(() => import('components/settings/PasswordAuthentication'));
const DeleteAccount = dynamic(() => import('components/settings/DeleteAccount'));

type SettingsList = typeof settingsList;
type Category = (typeof categories)[number];

export default function Page() {
  const { settingsList } = useGlobal();
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
      authenticationMethods: user ? <AuthenticationMethods key='authenticationMethods' /> : null,
      passwordAuthentication: user ? <PasswordAuthentication key='passwordAuthentication' /> : null,
      deleteAccount: user ? <DeleteAccount key='deleteAccount' /> : null,
    }),
    [user],
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
        for (const { isIntersecting, target } of entries) {
          if (isIntersecting) {
            setCurrentCategory(target.id.replace(/_/g, ' ') as Category);
            break;
          }
        }
      },
      { root: listRef.current, rootMargin: '-10% 0px -90%' },
    );
    if (listRef.current)
      Array.from(listRef.current.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);

  return (
    <Transition className='relative cursor-default'>
      <div className='absolute inset-0 h-full flex gap-x-5'>
        <nav className='relative flex flex-shrink-0 flex-col gap-3 overflow-x-hidden overflow-y-auto py-1 pr-2.5'>
          {categories.map((category) => (
            <Button
              key={category}
              className={twJoin([
                'group relative -my-0.5 px-0 py-1.5 transition-all',
                category === 'danger zone' && 'hover:text-error',
                currentCategory === category &&
                  'ml-2.5 text-bg hover:text-bg focus-visible:text-bg',
              ])}
              onClick={() =>
                document
                  .getElementById(replaceSpaces(category))
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              {currentCategory === category && (
                <m.div
                  className={twJoin([
                    'absolute -z-10 box-content h-full w-full px-2.5 transition-colors group-hover:bg-text group-focus-visible:bg-text',
                    currentCategory === 'danger zone' ? 'bg-error' : 'bg-main',
                  ])}
                  layoutId='navigation-box'
                  style={{ borderRadius: 8 }}
                  transition={{ duration: 0.15 }}
                />
              )}
              {category}
            </Button>
          ))}
        </nav>
        <main className='max-h-full flex flex-col gap-10 overflow-auto pb-2' ref={listRef}>
          {categories.map((category) => (
            <section key={category} className='flex flex-col gap-6' id={replaceSpaces(category)}>
              <Text
                asChild
                className={twJoin([
                  '-mb-1 pt-1 text-[28px] leading-none',
                  category === 'danger zone' ? 'text-error' : 'text-main',
                ])}
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
