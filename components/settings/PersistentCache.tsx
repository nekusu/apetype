'use client';

import { Button, Tooltip } from 'components/core';
import { useSettings } from 'context/settingsContext';
import { useDidMount } from 'hooks/useDidMount';
import { useState } from 'react';
import { RiQuestionLine } from 'react-icons/ri';
import { formatFileSize, getLocalStorageSize } from 'utils/misc';
import Setting from './Setting';

export default function PersistentCache() {
  const { persistentCache, cache } = useSettings();
  const [cacheSize, setCacheSize] = useState(0);

  const deleteCache = () => {
    localStorage.removeItem('app-cache');
    cache.load();
    setCacheSize(getLocalStorageSize('app-cache'));
  };

  useDidMount(() => {
    setCacheSize(getLocalStorageSize('app-cache'));
  });

  return (
    <Setting
      id='persistentCache'
      columns={2}
      customDescription={(description) => (
        <>
          {description}
          {(persistentCache || cacheSize > 0) && (
            <div className='flex items-center gap-1 text-main'>
              Cache size: {formatFileSize(cacheSize, true)}
              <Tooltip label='Reload page to see updated size' placement='right'>
                <div className='cursor-help'>
                  <RiQuestionLine />
                </div>
              </Tooltip>
            </div>
          )}
        </>
      )}
    >
      <Button className='col-span-full w-full' onClick={() => void deleteCache()} variant='danger'>
        clear cache
      </Button>
    </Setting>
  );
}
