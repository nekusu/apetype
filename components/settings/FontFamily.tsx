import { useDisclosure, useInputState } from '@mantine/hooks';
import { Button, Input, Modal, Text } from 'components/core';
import { ButtonProps } from 'components/core/Button';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import Setting from './Setting';

const COMMON_BUTTON_PROPS: Omit<ButtonProps, 'ref'> = { className: 'w-full', variant: 'filled' };

export default function FontFamily() {
  const { settingsList } = useGlobal();
  const { command, description, options } = settingsList.fontFamily;
  const { fontFamily, setSettings } = useSettings();
  const [modalOpen, modalHandler] = useDisclosure(false);
  const [customFont, setCustomFont] = useInputState('');
  const isCustomFont = !options.map(({ value }) => value).includes(fontFamily);

  return (
    <>
      <Setting
        key='fontFamily'
        title={command}
        description={description}
        options={options}
        gridColumns={4}
      >
        {options.map(({ alt, value }) => (
          <Button
            key={value}
            active={fontFamily === value}
            onClick={() => setSettings((draft) => void (draft.fontFamily = value))}
            style={{ fontFamily: `var(${value})` }}
            {...COMMON_BUTTON_PROPS}
          >
            {alt}
          </Button>
        ))}
        <Button active={isCustomFont} onClick={modalHandler.open} {...COMMON_BUTTON_PROPS}>
          custom {isCustomFont && `(${fontFamily})`}
        </Button>
      </Setting>
      <Modal
        className='w-full max-w-sm cursor-default'
        open={modalOpen}
        onClose={modalHandler.close}
        centered
      >
        <form
          className='flex flex-col gap-3.5'
          onSubmit={(event) => {
            event.preventDefault();
            setSettings((draft) => void (draft.fontFamily = customFont));
            modalHandler.close();
          }}
        >
          <Text asChild className='text-2xl'>
            <h3>Custom font</h3>
          </Text>
          <Input placeholder='Font name' value={customFont} onChange={setCustomFont} />
          <Text className='text-sm' dimmed>
            Make sure you have the font installed on your device before applying
          </Text>
          <Button type='submit' disabled={!customFont.length} {...COMMON_BUTTON_PROPS}>
            apply
          </Button>
        </form>
      </Modal>
    </>
  );
}
