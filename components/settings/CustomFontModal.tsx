'use client';

import { useDidUpdate, useInputState } from '@mantine/hooks';
import { Button, Input, Modal, Text } from 'components/core';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';

export interface CustomFontModalProps {
  modalOpen: boolean;
  onClose: () => void;
}

export default function CustomFontModal({ modalOpen, onClose }: CustomFontModalProps) {
  const { setGlobalValues } = useGlobal();
  const { setSettings } = useSettings();
  const [customFont, setCustomFont] = useInputState('');

  useDidUpdate(() => {
    setGlobalValues((draft) => void (draft.modalOpen = modalOpen));
    if (modalOpen) setCustomFont('');
  }, [modalOpen]);

  return (
    <Modal className='w-full max-w-sm cursor-default' open={modalOpen} onClose={onClose} centered>
      <form
        className='flex flex-col gap-3.5'
        onSubmit={(event) => {
          event.preventDefault();
          setSettings((draft) => void (draft.fontFamily = customFont));
          onClose();
        }}
      >
        <Text className='text-2xl' component='h3'>
          Custom font
        </Text>
        <Input placeholder='Font name' value={customFont} onChange={setCustomFont} />
        <Text className='text-sm' dimmed>
          Make sure you have the font installed on your device before applying
        </Text>
        <Button className='w-full' type='submit' variant='filled' disabled={!customFont.length}>
          apply
        </Button>
      </form>
    </Modal>
  );
}
