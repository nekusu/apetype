'use client';

import { useDidUpdate, useWindowEvent } from '@mantine/hooks';
import { Button, Tooltip, Transition } from 'components/core';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { TypingTestProvider } from 'context/typingTestContext';
import { AnimatePresence } from 'framer-motion';
import { useLanguage } from 'hooks/useLanguage';
import { useEffect } from 'react';
import { RiArrowRightLine, RiEarthFill, RiLockFill, RiRefreshLine } from 'react-icons/ri';
import { Result, Stats, Words } from '.';

export default function Test() {
  const {
    capsLock,
    isUserTyping,
    isTestFinished,
    setGlobalValues,
    modalOpen,
    commandLine,
    restartTest,
  } = useGlobal();
  const {
    mode,
    time,
    words,
    quickRestart,
    language: languageName,
    capsLockWarning,
  } = useSettings();
  const { language } = useLanguage(languageName);

  useEffect(() => {
    return () => setGlobalValues((draft) => void (draft.isTestFinished = false));
  }, [setGlobalValues]);
  useDidUpdate(() => {
    if (isTestFinished) setGlobalValues((draft) => void (draft.isUserTyping = false));
  }, [isTestFinished]);
  useDidUpdate(() => {
    if (language) restartTest();
  }, [language, mode, time, words]);
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
    <TypingTestProvider>
      <Transition className='row-start-2 row-end-3' transition={{ duration: 0.075 }}>
        <AnimatePresence mode='wait'>
          {isTestFinished ? (
            <Transition
              key='result'
              className='flex flex-col gap-8'
              transition={{ duration: 0.075 }}
            >
              <Result />
              <div className='flex w-full justify-center gap-4'>
                <Tooltip label='Next test' offset={8}>
                  <Button className='px-8 py-4 text-xl' variant='subtle' onClick={restartTest}>
                    <RiArrowRightLine />
                  </Button>
                </Tooltip>
              </div>
            </Transition>
          ) : (
            <Transition
              className='relative flex w-full select-none flex-col items-stretch justify-center gap-3'
              transition={{ duration: 0.075 }}
            >
              <Stats />
              <AnimatePresence>
                {!isUserTyping && (
                  <Transition className='absolute top-0 flex w-full justify-center gap-4'>
                    <Button className='p-0' onClick={() => commandLine.handler?.open('language')}>
                      <RiEarthFill />
                      {languageName}
                    </Button>
                  </Transition>
                )}
              </AnimatePresence>
              {capsLockWarning && capsLock && (
                <Button
                  active
                  className='absolute inset-x-0 -top-16 mx-auto px-3.5 py-3'
                  variant='filled'
                  onClick={() => commandLine.handler?.open('capsLockWarning')}
                >
                  <RiLockFill />
                  Caps Lock
                </Button>
              )}
              <Words />
              {!quickRestart && (
                <Tooltip label='Restart test' offset={8}>
                  <Button
                    className='mx-auto mt-2 px-8 py-4 text-xl'
                    variant='subtle'
                    onClick={restartTest}
                  >
                    <RiRefreshLine />
                  </Button>
                </Tooltip>
              )}
            </Transition>
          )}
        </AnimatePresence>
      </Transition>
    </TypingTestProvider>
  );
}
