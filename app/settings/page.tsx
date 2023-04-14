'use client';

import { Button, Text, Transition } from 'components/core';
import { ButtonProps } from 'components/core/Button';
import { FontFamily, ResetSettings, Setting, SoundOnClick, Theme } from 'components/settings';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { motion } from 'framer-motion';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { twJoin } from 'tailwind-merge';
import { replaceSpaces } from 'utils/misc';
import { categories, settingsList } from 'utils/settings';

type Category = (typeof categories)[number];

const CUSTOM_SETTINGS: (keyof typeof settingsList)[] = [
  'soundOnClick',
  'fontFamily',
  'theme',
  'resetSettings',
];
const COMMON_BUTTON_PROPS: Omit<ButtonProps, 'ref'> = { className: 'w-full', variant: 'filled' };

export default function Page() {
  const { settingsList, commandLine } = useGlobal();
  const settingsListValues = useMemo(
    () => Object.values(settingsList).filter(({ hidden }) => !hidden),
    [settingsList]
  );
  const settings = useSettings();
  const { setSettings } = settings;
  const [currentCategory, setCurrentCategory] = useState<Category>(categories[0]);
  const listRef = useRef<HTMLDivElement>(null);

  const settingsComponents = useMemo(() => {
    const components = settingsListValues.reduce(
      (components, { id, command, description, options }) => {
        if (CUSTOM_SETTINGS.includes(id)) return components;
        components[id as keyof typeof settingsList] = (
          <Setting key={id} title={command} description={description} options={options}>
            {options.length < 16 ? (
              options.map(({ alt, value }) => (
                <Button
                  key={alt ?? value.toString()}
                  active={settings[id] === value}
                  onClick={() => setSettings((draft) => void (draft[id] = value as never))}
                  {...COMMON_BUTTON_PROPS}
                >
                  {alt ?? value}
                </Button>
              ))
            ) : (
              <Button
                onClick={() => commandLine.handler?.open(id as keyof typeof settingsList)}
                {...COMMON_BUTTON_PROPS}
              >
                {settings[id] as ReactNode}
              </Button>
            )}
          </Setting>
        );
        return components;
      },
      {} as Record<keyof typeof settingsList, JSX.Element>
    );
    components.soundOnClick = <SoundOnClick key='soundOnClick' />;
    components.fontFamily = <FontFamily key='fontFamily' />;
    components.theme = <Theme key='theme' />;
    components.resetSettings = <ResetSettings key='resetSettings' />;
    return components;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { isIntersecting, target } of entries) {
          if (isIntersecting) {
            setCurrentCategory(target.id.replace(/_/g, ' ') as (typeof categories)[number]);
            break;
          }
        }
      },
      { root: listRef.current, rootMargin: '-10% 0px -90%' }
    );
    if (listRef.current)
      Array.from(listRef.current.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);

  return (
    <Transition className='relative cursor-default'>
      <div className='absolute inset-0 flex h-full gap-x-5'>
        <nav className='relative flex flex-shrink-0 flex-col gap-3 overflow-y-auto overflow-x-hidden py-1 pr-2.5'>
          {categories.map((category) => (
            <Button
              key={category}
              className={twJoin([
                'group relative -my-0.5 px-0 py-1.5 transition-all',
                currentCategory === category
                  ? 'ml-2.5 text-sub-alt hover:text-sub-alt focus:text-sub-alt'
                  : 'focus:text-sub',
              ])}
              onClick={() =>
                document
                  .getElementById(replaceSpaces(category))
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              {currentCategory === category && (
                <motion.div
                  className='absolute -z-10 box-content h-full w-full bg-main px-2.5 transition-colors group-hover:bg-text'
                  layoutId='navigation-box'
                  style={{ borderRadius: 8 }}
                  transition={{ duration: 0.15 }}
                />
              )}
              {category}
            </Button>
          ))}
        </nav>
        <main className='flex max-h-full flex-col gap-9 overflow-auto' ref={listRef}>
          {categories.map((category) => (
            <section key={category} className='flex flex-col gap-5' id={replaceSpaces(category)}>
              <Text
                asChild
                className={twJoin([
                  'pt-1 text-[28px] leading-none',
                  category === 'danger zone' ? 'text-error' : 'text-main',
                ])}
              >
                <h2>{category}</h2>
              </Text>
              {settingsListValues
                .filter((setting) => setting.category === category)
                .map(({ id }) => settingsComponents[id as keyof typeof settingsList])}
            </section>
          ))}
        </main>
      </div>
    </Transition>
  );
}
