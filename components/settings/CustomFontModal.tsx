'use client';

import { Button, Input, Modal, Text } from 'components/core';
import { useSettings } from 'context/settingsContext';
import { useEffect, useState } from 'react';

export interface CustomFontModalProps {
  modalOpen: boolean;
  onClose: () => void;
}

export default function CustomFontModal({ modalOpen, onClose }: CustomFontModalProps) {
  const { setSettings } = useSettings();
  const [customFont, setCustomFont] = useState('');

  useEffect(() => {
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
        <Input
          type='text'
          placeholder='Font name'
          value={customFont}
          onChange={({ target: { value } }) => setCustomFont(value)}
        />
        <Text className='text-sm' dimmed>
          Make sure you have the font installed on your device before applying
        </Text>
        <Button className='!w-full' type='submit' variant='filled' disabled={!customFont.length}>
          apply
        </Button>
      </form>
    </Modal>
  );
}
