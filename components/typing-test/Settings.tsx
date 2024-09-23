'use client';

import { Button } from '@/components/core/Button';
import { Divider } from '@/components/core/Divider';
import { Input } from '@/components/core/Input';
import { Key } from '@/components/core/Key';
import { Modal } from '@/components/core/Modal';
import { Text } from '@/components/core/Text';
import { Transition } from '@/components/core/Transition';
import { useSettings } from '@/context/settingsContext';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import { RiInputMethodFill, RiTimeFill, RiToolsFill } from 'react-icons/ri';

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

export function Settings() {
  const { settingsReference, ...settings } = useSettings();
  const { mode, setSettings } = settings;
  const mode2 = settings[mode];
  const [modalOpened, modalHandler] = useDisclosure(false);
  const [customAmount, setCustomAmount] = useState(0);
  const customActive = !settingsReference[mode].options.map(({ value }) => value).includes(mode2);
  const Icon = ICONS[mode];

  useEffect(() => {
    setCustomAmount(mode2);
  }, [mode2]);

  return (
    <Transition className='flex self-start justify-self-center rounded-lg bg-sub-alt px-2 transition hover:shadow-lg'>
      {settingsReference.mode.options.map(({ value }) => {
        const Icon = ICONS[value];
        return (
          <Button
            key={value}
            active={mode === value}
            className='px-2 py-3 text-xs'
            onClick={() => setSettings({ mode: value })}
            variant='text'
          >
            <Icon size={15} />
            {value}
          </Button>
        );
      })}
      <Divider className='mx-1.5' />
      {settingsReference[mode].options.map(({ value }) => (
        <Button
          key={value}
          active={mode2 === value}
          className='px-2 py-3 text-xs'
          onClick={() => setSettings({ [mode]: value })}
          variant='text'
        >
          {value}
        </Button>
      ))}
      {settingsReference[mode].custom && (
        <Button
          active={customActive}
          className='px-2 py-3 text-xs'
          onClick={modalHandler.open}
          variant='text'
        >
          <RiToolsFill size={15} />
          {customActive && (customAmount || 'Infinite')}
        </Button>
      )}
      <Modal className='w-full max-w-sm' opened={modalOpened} onClose={modalHandler.close}>
        <form
          className='flex flex-col gap-3.5'
          onSubmit={(event) => {
            event.preventDefault();
            setSettings({ [mode]: customAmount });
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
          <Button type='submit'>save</Button>
        </form>
      </Modal>
    </Transition>
  );
}
