'use client';

import { Button } from '@/components/core/Button';
import { Group } from '@/components/core/Group';
import { Modal } from '@/components/core/Modal';
import { Text } from '@/components/core/Text';
import { useSettings } from '@/context/settingsContext';
import { defaultSettings } from '@/utils/settings';
import { useDisclosure } from '@mantine/hooks';
import { Setting } from './Setting';

export function ResetSettings() {
  const { setSettings } = useSettings();
  const [modalOpened, modalHandler] = useDisclosure(false);

  return (
    <>
      <Setting id='resetSettings'>
        <Button onClick={modalHandler.open} variant='danger'>
          reset settings
        </Button>
      </Setting>
      <Modal className='w-full max-w-sm' opened={modalOpened} onClose={modalHandler.close}>
        <div className='flex flex-col gap-3.5'>
          <Text asChild className='text-2xl'>
            <h3>Reset settings</h3>
          </Text>
          <Text className='text-sm' dimmed>
            Are you sure you want to reset all your settings?
          </Text>
          <Group>
            <Button onClick={modalHandler.close}>cancel</Button>
            <Button
              onClick={() => {
                setSettings(defaultSettings);
                modalHandler.close();
              }}
              variant='danger'
            >
              reset
            </Button>
          </Group>
        </div>
      </Modal>
    </>
  );
}
