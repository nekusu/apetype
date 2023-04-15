'use client';

import { Button } from 'components/core';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { useDidMount } from 'hooks/useDidMount';
import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { formatFileSize, getLocalStorageSize } from 'utils/misc';
import { STATIC_URL } from 'utils/monkeytype';
import Setting from './Setting';

export default function PersistentCache() {
  const { settingsList } = useGlobal();
  const { command, description, options } = settingsList.persistentCache;
  const { persistentCache, setSettings } = useSettings();
  const { mutate } = useSWRConfig();
  const [cacheSize, setCacheSize] = useState(0);

  useDidMount(() => {
    setCacheSize(getLocalStorageSize('app-cache'));
  });

  return (
    <Setting
      title={command}
      description={
        <>
          {description}
          {(persistentCache || cacheSize > 0) && (
            <div className='text-main'>Cache size: {formatFileSize(cacheSize, true)}</div>
          )}
        </>
      }
      options={options}
    >
      {options.map(({ alt, value }) => (
        <Button
          key={value.toString()}
          active={persistentCache === value}
          className='w-full'
          onClick={() => setSettings((draft) => void (draft.persistentCache = value))}
          variant='filled'
        >
          {alt}
        </Button>
      ))}
      <Button
        className='col-span-2 w-full'
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
