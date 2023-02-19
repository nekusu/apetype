'use client';

import { useDisclosure } from '@mantine/hooks';
import { Button, Key, Text, Transition } from 'components/core';
import { ButtonProps } from 'components/core/Button';
import { CustomFontModal, Setting } from 'components/settings';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { useRef } from 'react';
import { twJoin } from 'tailwind-merge';
import { categories, settingsEntries, SettingsKey, settingsList } from 'utils/settings';

const CUSTOM_SETTINGS: SettingsKey[] = ['fontFamily'];
const COMMON_BUTTON_PROPS: Omit<ButtonProps, 'ref'> = {
  className: 'w-full',
  variant: 'filled',
};

export default function Page() {
  const { commandLineHandler } = useGlobal();
  const settings = useSettings();
  const { quickRestart, setSettings } = settings;
  const [customFontModalOpen, customFontModalHandler] = useDisclosure(false);
  const listRef = useRef<HTMLDivElement>(null);
  const scrollToCategory = (index: number) => {
    listRef.current?.children[index].scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const settingsComponents = settingsEntries.reduce(
    (components, [key, { command, description, options }]) => {
      if (CUSTOM_SETTINGS.includes(key)) return components;
      components[key] = (
        <Setting key={key} title={command} description={description} options={options}>
          {options.length < 16 ? (
            options.map((option) => (
              <Button
                key={option.alt ?? option.value}
                active={settings[key] === option.value}
                onClick={() => setSettings((draft) => void (draft[key] = option.value as never))}
                {...COMMON_BUTTON_PROPS}
              >
                {option.alt ?? option.value}
              </Button>
            ))
          ) : (
            <Button onClick={() => commandLineHandler.open(command)} {...COMMON_BUTTON_PROPS}>
              {settings[key]}
            </Button>
          )}
        </Setting>
      );
      return components;
    },
    {} as Record<SettingsKey, JSX.Element>
  );
  {
    const { command, description, options } = settingsList.fontFamily;
    const isCustomFont = !options.map(({ value }) => value).includes(settings.fontFamily);

    settingsComponents.fontFamily = (
      <Setting
        key='fontFamily'
        title={command}
        description={description}
        options={options}
        gridColumns={4}
      >
        {options.map((option) => (
          <Button
            key={option.value}
            active={settings.fontFamily === option.value}
            onClick={() => setSettings((draft) => void (draft.fontFamily = option.value as never))}
            style={{ fontFamily: `var(${option.value})` }}
            {...COMMON_BUTTON_PROPS}
          >
            {option.alt}
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

  return (
    <Transition className='relative w-full cursor-default'>
      <div className='absolute grid h-full w-full grid-cols-[auto_1fr] grid-rows-[auto_1fr] gap-x-5'>
        <Text className='col-span-full pb-5' dimmed>
          pro tip: you can also change all these settings quickly using the command line (
          <Key>{quickRestart === 'esc' ? 'tab' : 'esc'}</Key>)
        </Text>
        <div className='flex max-h-full max-w-[128px] flex-col gap-3 overflow-y-auto overflow-x-hidden pr-5'>
          {categories.map((category, index) => (
            <Button key={category} className='px-0 py-1' onClick={() => scrollToCategory(index)}>
              {category}
            </Button>
          ))}
        </div>
        <div className='flex max-h-full flex-col gap-10 overflow-y-auto' ref={listRef}>
          {categories.map((category) => (
            <div key={category} className='flex flex-col gap-5'>
              <Text
                className={twJoin([
                  'text-[28px] leading-none',
                  category === 'danger zone' ? 'text-error' : 'text-main',
                ])}
                component='h2'
              >
                {category}
              </Text>
              {settingsEntries
                .filter(([, setting]) => setting.category === category)
                .map(([key]) => settingsComponents[key])}
            </div>
          ))}
        </div>
      </div>
      <CustomFontModal modalOpen={customFontModalOpen} onClose={customFontModalHandler.close} />
    </Transition>
  );
}
