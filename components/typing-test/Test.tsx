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
import { toast } from 'react-hot-toast';
import {
  RiArrowRightLine,
  RiEarthFill,
  RiEyeOffFill,
  RiImageFill,
  RiLockFill,
  RiPauseCircleFill,
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
    blindMode,
    language: languageName,
    stopOnError,
    lazyMode,
    keymap,
    themeType,
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
        backgroundColor: themeType === 'custom' ? colors.custom?.bg : colors.preset?.bg,
        height: resultRef.current.clientHeight + 80,
        width: resultRef.current.clientWidth + 80,
        style: { padding: '40px' },
      }).then((dataUrl) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'typing-test.png';
        link.click();
        setShowResultDate(false);
        toast.success('Screenshot saved successfully!');
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
  }, [mode, time, words, blindMode, language, stopOnError, lazyMode]);
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
                    <Text className='text-3xl font-[var(--font-lexend-deca)]' dimmed>
                      apetype
                    </Text>
                    <Text className='text-2xl' dimmed>
                      {dayjs().format('DD MMM YYYY HH:mm')}
                    </Text>
                  </div>
                )}
              </div>
              <div className='w-full flex justify-center gap-4'>
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
              className='relative w-full flex flex-col select-none items-stretch justify-center gap-3'
              transition={{ duration: 0.075 }}
            >
              <Stats />
              <AnimatePresence>
                {!isUserTyping && (
                  <Transition className='absolute top-0 w-full flex justify-center gap-6'>
                    <Button className='p-0' onClick={() => commandLine.handler?.open('language')}>
                      <RiEarthFill />
                      {languageName}
                    </Button>
                    {blindMode && (
                      <Button
                        className='p-0'
                        onClick={() => commandLine.handler?.open('blindMode')}
                      >
                        <RiEyeOffFill />
                        blind
                      </Button>
                    )}
                    {stopOnError && (
                      <Button
                        className='p-0'
                        onClick={() => commandLine.handler?.open('stopOnError')}
                      >
                        <RiPauseCircleFill />
                        stop on {stopOnError}
                      </Button>
                    )}
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
                  className='absolute inset-x-0 mx-auto px-3.5 py-3 -top-16'
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
