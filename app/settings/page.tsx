'use client';

import { useDisclosure } from '@mantine/hooks';
import { Button, Text, Transition } from 'components/core';
import { ButtonProps } from 'components/core/Button';
import { CustomFontModal, Setting, ThemeBubbles } from 'components/settings';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { motion } from 'framer-motion';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { RiLoaderLine, RiCheckLine } from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';
import tinycolor from 'tinycolor2';
import { replaceSpaces } from 'utils/misc';
import { SettingId, categories, settingsList, settingsWithIds } from 'utils/settings';

const CUSTOM_SETTINGS: SettingId[] = ['fontFamily', 'theme'];
const COMMON_BUTTON_PROPS: Omit<ButtonProps, 'ref'> = { className: 'w-full', variant: 'filled' };

export default function Page() {
  const { themes, isThemeLoading, commandLineHandler } = useGlobal();
  const settings = useSettings();
  const { setSettings } = settings;
  const [customFontModalOpen, customFontModalHandler] = useDisclosure(false);
  const [currentCategory, setCurrentCategory] = useState<(typeof categories)[number]>(
    categories[0]
  );
  const listRef = useRef<HTMLDivElement>(null);

  const settingsComponents = useMemo(() => {
    const components = settingsWithIds.reduce(
      (components, { id, command, description, options }) => {
        if (CUSTOM_SETTINGS.includes(id)) return components;
        components[id] = (
          <Setting key={id} title={command} description={description} options={options}>
            {options.length < 16 ? (
              options.map(({ alt, value }) => (
                <Button
                  key={alt ?? value}
                  active={settings[id] === value}
                  onClick={() => setSettings((draft) => void (draft[id] = value as never))}
                  {...COMMON_BUTTON_PROPS}
                >
                  {alt ?? value}
                </Button>
              ))
            ) : (
              <Button onClick={() => commandLineHandler.open(id)} {...COMMON_BUTTON_PROPS}>
                {settings[id] as ReactNode}
              </Button>
            )}
          </Setting>
        );
        return components;
      },
      {} as Record<SettingId, JSX.Element>
    );
    {
      const { command, description, options } = settingsList.fontFamily;
      const isCustomFont = !options.map(({ value }) => value).includes(settings.fontFamily);
      components.fontFamily = (
        <Setting
          key='fontFamily'
          title={command}
          description={description}
          options={options}
          gridColumns={4}
        >
          {options.map(({ alt, value }) => (
            <Button
              key={value}
              active={settings.fontFamily === value}
              onClick={() => setSettings((draft) => void (draft.fontFamily = value as never))}
              style={{ fontFamily: `var(${value})` }}
              {...COMMON_BUTTON_PROPS}
            >
              {alt}
            </Button>
          ))}
          <Button
            active={isCustomFont}
            onClick={customFontModalHandler.open}
            {...COMMON_BUTTON_PROPS}
          >
            custom {isCustomFont && `(${settings.fontFamily})`}
          </Button>
        </Setting>
      );
    }
    {
      const { command, description, options } = settingsList.theme;
      const sortedOptions = [...options].sort((a, b) => {
        const bgColorA = tinycolor(themes[a.value].bgColor);
        const bgColorB = tinycolor(themes[b.value].bgColor);
        return bgColorB.getLuminance() - bgColorA.getLuminance();
      });
      components.theme = (
        <Setting
          key='theme'
          title={command}
          description={description}
          options={options}
          gridColumns={4}
        >
          {sortedOptions.map(({ value }) => {
            const theme = themes[value];
            const { bgColor, textColor } = theme;
            const selected = settings.theme === value;
            return (
              <Button
                key={value}
                className={twJoin([
                  'group grid w-full grid-cols-[1fr_auto_1fr] justify-items-end text-sm outline-0 hover:-translate-y-0.5 hover:shadow-lg',
                  selected && 'outline-2 outline-text',
                ])}
                variant='filled'
                onClick={() => setSettings((draft) => void (draft.theme = value as never))}
                style={{ background: bgColor, color: textColor, outlineColor: textColor }}
              >
                <span className='justify-self-start' />
                {value}
                {selected ? (
                  isThemeLoading ? (
                    <RiLoaderLine className='animate-spin' size={18} />
                  ) : (
                    <RiCheckLine size={18} />
                  )
                ) : (
                  <ThemeBubbles
                    className='opacity-0 transition-opacity group-hover:opacity-100'
                    {...theme}
                  />
                )}
              </Button>
            );
          })}
        </Setting>
      );
    }
    return components;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isThemeLoading, settings]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { isIntersecting, target } of entries) {
          if (isIntersecting) {
            setCurrentCategory(target.id.replace(/-/g, ' ') as (typeof categories)[number]);
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
                'group relative -my-0.5 py-1.5 px-0 transition-all',
                currentCategory === category
                  ? 'ml-2.5 text-sub-alt hover:text-sub-alt focus:text-sub-alt'
                  : 'focus:text-sub',
              ])}
              onClick={() =>
                document
                  .getElementById(replaceSpaces(category, '-'))
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
        <div className='flex max-h-full flex-col gap-9 overflow-auto' ref={listRef}>
          {categories.map((category) => (
            <section
              key={category}
              className='flex flex-col gap-5'
              id={category.replaceAll(' ', '-')}
            >
              <Text
                className={twJoin([
                  'pt-1 text-[28px] leading-none',
                  category === 'danger zone' ? 'text-error' : 'text-main',
                ])}
                component='h2'
              >
                {category}
              </Text>
              {settingsWithIds
                .filter((setting) => setting.category === category)
                .map(({ id }) => settingsComponents[id])}
            </section>
          ))}
        </div>
      </div>
      <CustomFontModal modalOpen={customFontModalOpen} onClose={customFontModalHandler.close} />
    </Transition>
  );
}
