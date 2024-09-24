'use client';

import { Button } from '@/components/core/Button';
import { Input } from '@/components/core/Input';
import { Modal } from '@/components/core/Modal';
import { Text } from '@/components/core/Text';
import { useSettings } from '@/context/settingsContext';
import fonts from '@/utils/fonts';
import { useDisclosure, useInputState } from '@mantine/hooks';
import { RiFontSize } from 'react-icons/ri';
import { Setting } from './Setting';

export function FontFamily() {
  const { settingsReference, fontFamily, setSettings } = useSettings();
  const { options } = settingsReference.fontFamily;
  const [modalOpened, modalHandler] = useDisclosure(false);
  const [customFont, setCustomFont] = useInputState('');
  const isCustomFont = !options.map(({ value }) => value).includes(fontFamily);

  return (
    <>
      <Setting
        id='fontFamily'
        buttonProps={({ value }) => ({ className: fonts[value].className })}
        columns={4}
      >
        <Button active={isCustomFont} onClick={modalHandler.open}>
          custom {isCustomFont && `(${fontFamily})`}
        </Button>
      </Setting>
      <Modal className='w-full max-w-sm' opened={modalOpened} onClose={modalHandler.close}>
        <form
          className='flex flex-col gap-3.5'
          onSubmit={(event) => {
            event.preventDefault();
            setSettings({ fontFamily: customFont });
            modalHandler.close();
          }}
        >
          <Text asChild className='text-2xl'>
            <h3>Custom font</h3>
          </Text>
          <Input
            placeholder='Font name'
            leftNode={<RiFontSize />}
            value={customFont}
            onChange={setCustomFont}
          />
          <Text className='text-sm' dimmed>
            Make sure you have the font installed on your device before applying.
          </Text>
          <Button type='submit' disabled={!customFont.length}>
            apply
          </Button>
        </form>
      </Modal>
    </>
  );
}
