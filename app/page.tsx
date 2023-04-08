'use client';

import { useDidUpdate, useWindowEvent } from '@mantine/hooks';
import { Button, Tooltip, Transition } from 'components/core';
import { Settings, Test, Tips } from 'components/typing-test';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { AnimatePresence } from 'framer-motion';
import { RiTerminalLine } from 'react-icons/ri';

export default function Home() {
  const { testId, isUserTyping, isTestFinished, modalOpen, commandLine, restartTest } = useGlobal();
  const { quickRestart, keyTips } = useSettings();

  useDidUpdate(() => {
    if (isUserTyping) document.body.requestPointerLock();
    else document.exitPointerLock();
  }, [isUserTyping]);
  useWindowEvent('keydown', (event) => {
    if (!modalOpen && quickRestart && event.key === (quickRestart === 'tab' ? 'Tab' : 'Escape')) {
      event.preventDefault();
      restartTest();
    }
  });

  return (
    <Transition className='relative grid w-full grid-rows-[1fr_auto_1.25fr] gap-3'>
      <AnimatePresence>
        {!isUserTyping && !isTestFinished && <Settings key='settings' />}
        <AnimatePresence mode='wait'>
          <Test key={testId} />
        </AnimatePresence>
        {!isUserTyping && (
          <Transition key='bottom' className='row-start-3 row-end-4 h-min self-end'>
            {keyTips && <Tips key='tips' />}
            <Tooltip label='Open command line' offset={8} placement='left'>
              <Button
                className='absolute right-0 bottom-0 rounded-[50%] p-2.5'
                variant='filled'
                active
                onClick={() => commandLine.handler?.open()}
              >
                <RiTerminalLine size={18} />
              </Button>
            </Tooltip>
          </Transition>
        )}
      </AnimatePresence>
    </Transition>
  );
}
