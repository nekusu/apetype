'use client';

import { Key, Text } from 'components/core';
import { useSettings } from 'context/settingsContext';

export default function Tips() {
  const { mode, time, words, quickRestart } = useSettings();

  return (
    <div className='flex flex-col select-none items-center gap-1.5'>
      {((mode === 'time' && !time) || (mode === 'words' && !words)) && (
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
