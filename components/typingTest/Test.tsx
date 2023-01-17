'use client';

import { Button, Tooltip, Transition } from 'components/core';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { TypingTestProvider } from 'context/typingTestContext';
import { RiLockFill, RiRefreshLine } from 'react-icons/ri';
import { useImmer } from 'use-immer';
import { initialValues } from 'utils/typingTest';
import { Stats, Words } from '.';

export default function Test() {
  const { language, capsLock, restartTest } = useGlobal();
  const { quickRestart } = useSettings();
  const [values, setValues] = useImmer(initialValues);

  return (
    <TypingTestProvider setValues={setValues} {...values}>
      {language && (
        <Transition
          className='relative row-start-2 row-end-3 flex w-full select-none flex-col items-stretch justify-center gap-3'
          transition={{ duration: 0.075 }}
        >
          <Stats />
          {capsLock && (
            <Button
              active
              className='absolute inset-x-0 -top-16 mx-auto py-3 px-3.5'
              variant='filled'
            >
              <RiLockFill />
              Caps Lock
            </Button>
          )}
          <Words />
          {!quickRestart && (
            <Tooltip label='Restart test' offset={8}>
              <Button
                className='mx-auto mt-2 py-4 px-8 text-xl'
                variant='subtle'
                onClick={restartTest}
              >
                <RiRefreshLine />
              </Button>
            </Tooltip>
          )}
        </Transition>
      )}
    </TypingTestProvider>
  );
}
