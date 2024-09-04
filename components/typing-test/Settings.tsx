'use client';

import { Button, Divider, Input, Key, Modal, Text, Transition } from '@/components/core';
import { useGlobal } from '@/context/globalContext';
import { useSettings } from '@/context/settingsContext';
import { useDidUpdate, useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import { RiInputMethodFill, RiTimeFill, RiToolsFill } from 'react-icons/ri';

const DEFAULT_ICON_SIZE = 15;
const ICONS: Record<string, IconType> = {
  time: RiTimeFill,
  words: RiInputMethodFill,
};

function getDurationPreview(time: number) {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  let timeString = '';
  if (hours) timeString += `${hours} hour${hours > 1 ? 's' : ''} `;
  if (minutes) timeString += `${minutes} minute${minutes > 1 ? 's' : ''} `;
  if (seconds) timeString += `${seconds} second${seconds > 1 ? 's' : ''}`;

  return `Total time: ${timeString}`;
}

export default function Settings() {
  const { settingsList } = useGlobal();
  const settings = useSettings();
  const { mode, setSettings } = settings;
  const [modalOpen, modalHandler] = useDisclosure(false);
  const [customAmount, setCustomAmount] = useState(settings[mode]);
  const customActive = !settingsList[mode].options
    .map(({ value }) => value)
    .includes(settings[mode]);
  const Icon = ICONS[mode];

  useEffect(() => {
    setCustomAmount(settings[mode]);
  }, [mode, settings]);
  useDidUpdate(() => {
    if (modalOpen) setCustomAmount(settings[mode]);
  }, [modalOpen, mode, settings]);

  return (
    <Transition className='flex self-start justify-self-center rounded-lg bg-sub-alt px-2 transition hover:shadow-lg'>
      {settingsList.mode.options.map(({ value }) => {
        const Icon = ICONS[value];

        return (
          <Button
            key={value}
            active={mode === value}
            className='px-2 py-3 text-xs'
            onClick={() =>
              setSettings((draft) => {
                draft.mode = value;
              })
            }
          >
            <Icon size={DEFAULT_ICON_SIZE} />
            {value}
          </Button>
        );
      })}
      <Divider className='mx-1.5' />
      {settingsList[mode].options.map(({ value }) => (
        <Button
          key={value}
          active={settings[mode] === value}
          className='px-2 py-3 text-xs'
          onClick={() =>
            setSettings((draft) => {
              draft[mode] = value;
            })
          }
        >
          {value}
        </Button>
      ))}
      {settingsList[mode].custom && (
        <Button active={customActive} className='px-2 py-3 text-xs' onClick={modalHandler.open}>
          <RiToolsFill size={DEFAULT_ICON_SIZE} />
          {customActive && (customAmount || 'Infinite')}
        </Button>
      )}
      <Modal className='w-full max-w-sm' open={modalOpen} onClose={modalHandler.close} centered>
        <form
          className='flex flex-col gap-3.5'
          onSubmit={(event) => {
            event.preventDefault();
            setSettings((draft) => {
              draft[mode] = customAmount;
            });
            modalHandler.close();
          }}
        >
          <Text asChild className='text-2xl'>
            <h3>{mode === 'time' ? 'Test duration' : 'Word amount'}</h3>
          </Text>
          {(!customAmount || mode === 'time') && (
            <Text className='text-sm' dimmed>
              {(!customAmount && 'Infinite test') || getDurationPreview(customAmount)}
            </Text>
          )}
          <Input
            type='number'
            leftNode={<Icon />}
            min={0}
            value={customAmount.toString()}
            onChange={({ target: { value } }) => setCustomAmount(+value)}
          />
          <Text className='text-sm' dimmed>
            You can start an infinite test by inputting 0. To stop the test, use <Key>shift</Key> +{' '}
            <Key>enter</Key>
          </Text>
          <Button className='w-full' type='submit' variant='filled'>
            ok
          </Button>
        </form>
      </Modal>
    </Transition>
  );
}
