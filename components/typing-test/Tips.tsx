'use client';

import { Key, Text } from 'components/core';
import { useSettings } from 'context/settingsContext';

export default function Tips() {
  const { time, quickRestart } = useSettings();

  return (
    <div className='flex select-none flex-col items-center gap-1.5'>
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
    </div>
  );
}
