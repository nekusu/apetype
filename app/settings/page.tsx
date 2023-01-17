'use client';

import clsx from 'clsx';
import { Button, Key, Text, Transition } from 'components/core';
import { Setting } from 'components/settings';
import { useSettings } from 'context/settingsContext';
import { useRef } from 'react';
import { categories, Settings, settingsList } from 'utils/settings';

export default function Page() {
  const settings = useSettings();
  const { quickRestart, setSettings } = settings;
  const listRef = useRef<HTMLDivElement>(null);
  const scrollToCategory = (index: number) => {
    listRef.current?.children[index].scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

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
                className={clsx([
                  '!text-[28px] leading-none',
                  category === 'danger zone' ? '!text-error' : '!text-main',
                ])}
                component='h2'
              >
                {category}
              </Text>
              {Object.entries(settingsList)
                .filter(([, setting]) => setting.category === category)
                .map(([key, { command, description, options }]) => (
                  <Setting
                    key={key}
                    id={key as keyof Settings}
                    value={settings[key as keyof Settings]}
                    title={command}
                    description={description}
                    options={options}
                    setSettings={setSettings}
                  />
                ))}
            </div>
          ))}
        </div>
      </div>
    </Transition>
  );
}
