'use client';

import { Key, Text, Transition } from 'components/core';
import { useSettings } from 'context/settingsContext';

export default function Tips() {
  const { time, quickRestart } = useSettings();

  return (
    <Transition className='row-start-3 row-end-4 flex select-none flex-col items-center justify-end gap-1.5 self-end justify-self-center'>
      {!time && (
        <Text className='text-xs' dimmed>
          <Key>shift</Key> + <Key>enter</Key> - stop test
        </Text>
      )}
      <Text className='text-xs' dimmed>
        <Key>{quickRestart === 'esc' ? 'esc' : 'tab'}</Key>
        {!quickRestart && (
          <>
            {' '}
            + <Key>enter</Key>
          </>
        )}{' '}
        - restart test
      </Text>
      <Text className='text-xs' dimmed>
        <Key>{quickRestart === 'esc' ? 'tab' : 'esc'}</Key> - command line
      </Text>
    </Transition>
  );
}
