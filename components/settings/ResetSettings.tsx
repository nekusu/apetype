'use client';

import { useDisclosure } from '@mantine/hooks';
import { Button, Modal, Text } from 'components/core';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { defaultSettings } from 'utils/settings';
import Setting from './Setting';

export default function ResetSettings() {
  const { settingsList } = useGlobal();
  const { setSettings } = useSettings();
  const { command, description, options } = settingsList.resetSettings;
  const [modalOpen, modalHandler] = useDisclosure(false);

  return (
    <>
      <Setting title={command} description={description} options={options}>
        <Button className='w-full' onClick={modalHandler.open} variant='danger'>
          reset settings
        </Button>
      </Setting>
      <Modal
        className='w-full max-w-sm cursor-default'
        open={modalOpen}
        onClose={modalHandler.close}
        centered
      >
        <div className='flex flex-col gap-3.5'>
          <Text asChild className='text-2xl'>
            <h3>Reset settings</h3>
          </Text>
          <Text className='text-sm' dimmed>
            Are you sure you want to reset all your settings?
          </Text>
          <div className='flex gap-2'>
            <Button className='w-full' onClick={modalHandler.close} variant='filled'>
              cancel
            </Button>
            <Button
              className='w-full'
              onClick={() => {
                setSettings(defaultSettings);
                modalHandler.close();
              }}
              variant='danger'
            >
              reset
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
