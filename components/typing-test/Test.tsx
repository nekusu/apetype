'use client';

import { useDidUpdate, useWindowEvent } from '@mantine/hooks';
import { Button, Text, Tooltip, Transition } from 'components/core';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { useTheme } from 'context/themeContext';
import { TypingTestProvider } from 'context/typingTestContext';
import dayjs from 'dayjs';
import { AnimatePresence } from 'framer-motion';
import { useLanguage } from 'hooks/useLanguage';
import { toPng } from 'html-to-image';
import { useEffect, useRef, useState } from 'react';
import {
  RiArrowRightLine,
  RiEarthFill,
  RiImageFill,
  RiLockFill,
  RiRefreshLine,
  RiZzzLine,
} from 'react-icons/ri';
import { Keymap, Result, Sound, Stats, Words } from '.';

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
    lazyMode,
    keymap,
    capsLockWarning,
  } = useSettings();
  const { colors } = useTheme();
  const { language } = useLanguage(languageName);
  const [showResultDate, setShowResultDate] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const saveScreenshot = () => {
    setShowResultDate(true);
    setTimeout(() => {
      if (!resultRef.current) return;
      void toPng(resultRef.current, {
        backgroundColor: colors.custom?.bg ?? colors.preset?.bg,
        height: resultRef.current.clientHeight + 80,
        width: resultRef.current.clientWidth + 80,
        style: { padding: '40px' },
      }).then((dataUrl) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'typing-test.png';
        link.click();
        setShowResultDate(false);
      });
    }, 0);
  };

  useEffect(() => {
    return () => setGlobalValues((draft) => void (draft.isTestFinished = false));
  }, [setGlobalValues]);
  useDidUpdate(() => {
    if (isTestFinished) setGlobalValues((draft) => void (draft.isUserTyping = false));
  }, [isTestFinished]);
  useDidUpdate(() => {
    if (language) restartTest();
  }, [language, lazyMode, mode, time, words]);
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
      <Sound />
      <Transition className='row-start-2 row-end-3' transition={{ duration: 0.075 }}>
        <AnimatePresence mode='wait'>
          {isTestFinished ? (
            <Transition
              key='result'
              className='flex flex-col gap-8'
              transition={{ duration: 0.075 }}
            >
              <div ref={resultRef} className='flex flex-col gap-8'>
                <Result />
                {showResultDate && (
                  <div className='flex items-end justify-between gap-2'>
                    <Text className='font-[family-name:var(--font-lexend-deca)] text-3xl' dimmed>
                      apetype
                    </Text>
                    <Text className='text-2xl' dimmed>
                      {dayjs().format('DD MMM YYYY HH:mm')}
                    </Text>
                  </div>
                )}
              </div>
              <div className='flex w-full justify-center gap-4'>
                <Tooltip label='Next test' offset={8}>
                  <Button className='px-8 py-4 text-xl' variant='subtle' onClick={restartTest}>
                    <RiArrowRightLine />
                  </Button>
                </Tooltip>
                <Tooltip label='Save screenshot' offset={8}>
                  <Button className='px-8 py-4 text-xl' variant='subtle' onClick={saveScreenshot}>
                    <RiImageFill />
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
                  <Transition className='absolute top-0 flex w-full justify-center gap-5'>
                    <Button className='p-0' onClick={() => commandLine.handler?.open('language')}>
                      <RiEarthFill />
                      {languageName}
                    </Button>
                    {lazyMode && !language?.noLazyMode && (
                      <Button className='p-0' onClick={() => commandLine.handler?.open('lazyMode')}>
                        <RiZzzLine />
                        lazy
                      </Button>
                    )}
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
              {keymap && <Keymap />}
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
