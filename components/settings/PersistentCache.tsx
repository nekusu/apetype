'use client';

import { Button } from 'components/core';
import { useSettings } from 'context/settingsContext';
import { useDidMount } from 'hooks/useDidMount';
import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { formatFileSize, getLocalStorageSize } from 'utils/misc';
import { STATIC_URL } from 'utils/monkeytype';
import Setting from './Setting';

export default function PersistentCache() {
  const { persistentCache } = useSettings();
  const { mutate } = useSWRConfig();
  const [cacheSize, setCacheSize] = useState(0);

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
            <div className='text-main'>Cache size: {formatFileSize(cacheSize, true)}</div>
          )}
        </>
      )}
    >
      <Button
        className='col-span-full w-full'
        onClick={() => {
          void mutate((key) => typeof key === 'string' && key.includes(STATIC_URL), undefined);
          localStorage.removeItem('app-cache');
          setCacheSize(getLocalStorageSize('app-cache'));
        }}
        variant='danger'
      >
        clear cache
      </Button>
    </Setting>
  );
}
