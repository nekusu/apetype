'use client';

import { useDidUpdate, useWindowEvent } from '@mantine/hooks';
import { Transition } from 'components/core';
import { Settings, Test, Tips } from 'components/typing-test';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { AnimatePresence } from 'framer-motion';

export default function Home() {
  const { language, testId, isUserTyping, isTestFinished, modalOpen, restartTest } = useGlobal();
  const { mode, time, words, quickRestart } = useSettings();

  useDidUpdate(() => {
    if (language) restartTest();
  }, [language, mode, time, words]);
  useDidUpdate(() => {
    if (isUserTyping) {
      document.body.requestPointerLock();
    } else {
      document.exitPointerLock();
    }
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
        {!isUserTyping && <Tips key='tips' />}
      </AnimatePresence>
    </Transition>
  );
}
