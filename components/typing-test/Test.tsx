'use client';

import { Button, Tooltip, Transition } from 'components/core';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { TypingTestProvider } from 'context/typingTestContext';
import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { RiArrowRightLine, RiEarthFill, RiLockFill, RiRefreshLine } from 'react-icons/ri';
import { useImmer } from 'use-immer';
import { initialValues } from 'utils/typingTest';
import { Result, Stats, Words } from '.';

export default function Test() {
  const {
    capsLock,
    isUserTyping,
    isTestFinished,
    setGlobalValues,
    commandLineHandler,
    restartTest,
  } = useGlobal();
  const { quickRestart, language, capsLockWarning } = useSettings();
  const [values, setValues] = useImmer(initialValues);

  useEffect(() => {
    if (isTestFinished) setGlobalValues((draft) => void (draft.isUserTyping = false));
  }, [isTestFinished, setGlobalValues]);
  useEffect(() => {
    return () => setGlobalValues((draft) => void (draft.isTestFinished = false));
  }, [setGlobalValues]);

  return (
    <TypingTestProvider setValues={setValues} {...values}>
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
                  <Button className='py-4 px-8 text-xl' variant='subtle' onClick={restartTest}>
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
                    <Button className='p-0' onClick={() => commandLineHandler.open('language')}>
                      <RiEarthFill />
                      {language}
                    </Button>
                  </Transition>
                )}
              </AnimatePresence>
              {capsLockWarning && capsLock && (
                <Button
                  active
                  className='absolute inset-x-0 -top-16 mx-auto py-3 px-3.5'
                  variant='filled'
                  onClick={() => commandLineHandler.open('caps lock warning')}
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
        </AnimatePresence>
      </Transition>
    </TypingTestProvider>
  );
}
