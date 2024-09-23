'use client';

import { Button } from '@/components/core/Button';
import { Group } from '@/components/core/Group';
import { Modal } from '@/components/core/Modal';
import { Text } from '@/components/core/Text';
import { useSettings } from '@/context/settingsContext';
import { useDidMount } from '@/hooks/useDidMount';
import { formatFileSize, getLocalStorageSize } from '@/utils/misc';
import { useDidUpdate, useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Setting } from './Setting';

export function PersistentCache() {
  const { setSettings } = useSettings();
  const [cacheSize, setCacheSize] = useState(0);
  const [confirmationModalOpened, confirmationModalHandler] = useDisclosure(false);
  const [isReloading, setIsReloading] = useState(false);

  const deleteCache = () => {
    localStorage.removeItem('ape-cache');
    setCacheSize(getLocalStorageSize('ape-cache'));
    toast.success('Cache cleared! The page will be reloaded.', { duration: 3000 });
    setTimeout(() => location.reload(), 3000);
  };

  useDidMount(() => {
    setCacheSize(getLocalStorageSize('ape-cache'));
  });
  useDidUpdate(() => {
    if (!confirmationModalOpened)
      setSettings(({ persistentCache }) => ({ persistentCache: !persistentCache }));
  }, [confirmationModalOpened]);

  return (
    <>
      <Setting
        id='persistentCache'
        columns={2}
        buttonProps={({ value }) => ({
          onClick: () => {
            setSettings({ persistentCache: value });
            confirmationModalHandler.open();
          },
        })}
        customDescription={(description) => (
          <>
            {description}
            {cacheSize > 0 && (
              <Text className='mt-1 text-main'>Cache size: {formatFileSize(cacheSize, true)}</Text>
            )}
          </>
        )}
      >
        <Button
          disabled={!cacheSize}
          className='col-span-full'
          onClick={deleteCache}
          variant='danger'
        >
          clear cache
        </Button>
      </Setting>
      <Modal
        className='w-full max-w-sm'
        opened={confirmationModalOpened}
        onClose={isReloading ? undefined : confirmationModalHandler.close}
      >
        <div className='flex flex-col gap-3.5'>
          <Text asChild className='text-2xl'>
            <h3>Reload page</h3>
          </Text>
          <Text className='text-sm' dimmed>
            You need to reload the page to apply this setting.
          </Text>
          <Group>
            <Button disabled={isReloading} onClick={confirmationModalHandler.close}>
              cancel
            </Button>
            <Button
              active
              loading={isReloading}
              onClick={() => {
                location.reload();
                setIsReloading(true);
              }}
            >
              reload
            </Button>
          </Group>
        </div>
      </Modal>
    </>
  );
}
