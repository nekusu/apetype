'use client';

import { Button } from '@/components/core/Button';
import { Text } from '@/components/core/Text';
import { Transition } from '@/components/core/Transition';
import { AuthenticationMethods } from '@/components/settings/AuthenticationMethods';
import { DeleteAccount } from '@/components/settings/DeleteAccount';
import { FontFamily } from '@/components/settings/FontFamily';
import { ImportExportSettings } from '@/components/settings/ImportExportSettings';
import { PasswordAuthentication } from '@/components/settings/PasswordAuthentication';
import { PersistentCache } from '@/components/settings/PersistentCache';
import { ResetAccount } from '@/components/settings/ResetAccount';
import { ResetPersonalBests } from '@/components/settings/ResetPersonalBests';
import { ResetSettings } from '@/components/settings/ResetSettings';
import { Setting } from '@/components/settings/Setting';
import { SoundOnClick } from '@/components/settings/SoundOnClick';
import { Theme } from '@/components/settings/Theme';
import { useSettings } from '@/context/settingsContext';
import { useUser } from '@/context/userContext';
import { replaceSpaces } from '@/utils/misc';
import { type SettingsReference, categories } from '@/utils/settings';
import { m } from 'framer-motion';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { twJoin } from 'tailwind-merge';

type Category = (typeof categories)[number];

export default function SettingsPage() {
  const { settingsReference } = useSettings();
  const { user } = useUser();
  const settingsEntries = useMemo(
    () =>
      Object.entries(settingsReference).filter(([, { hidden }]) => !hidden) as [
        keyof SettingsReference,
        SettingsReference[keyof SettingsReference],
      ][],
    [settingsReference],
  );
  const customComponents: Partial<Record<keyof SettingsReference, ReactNode>> = useMemo(
    () => ({
      soundOnClick: <SoundOnClick key='soundOnClick' />,
      fontFamily: <FontFamily key='fontFamily' />,
      theme: <Theme key='theme' />,
      importExportSettings: <ImportExportSettings key='importExportSettings' />,
      resetSettings: <ResetSettings key='resetSettings' />,
      persistentCache: <PersistentCache key='persistentCache' />,
      authenticationMethods: user && <AuthenticationMethods key='authenticationMethods' />,
      passwordAuthentication: user && <PasswordAuthentication key='passwordAuthentication' />,
      resetPersonalBests: user && <ResetPersonalBests key='resetPersonalBests' />,
      resetAccount: user && <ResetAccount key='resetAccount' />,
      deleteAccount: user && <DeleteAccount key='deleteAccount' />,
    }),
    [user],
  );
  const settingsComponents = useMemo(() => {
    const components = settingsEntries.reduce(
      (components, [id]) => {
        if (!customComponents[id]) components[id] = <Setting key={id} id={id} />;
        return components;
      },
      {} as Record<keyof SettingsReference, ReactNode>,
    );
    return { ...components, ...customComponents };
  }, [customComponents, settingsEntries]);
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
              {settingsEntries
                .filter(([, setting]) => setting.category === category)
                .map(([id]) => settingsComponents[id])}
            </section>
          ))}
        </main>
      </div>
    </Transition>
  );
}
