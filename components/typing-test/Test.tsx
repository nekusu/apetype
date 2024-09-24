'use client';

import { Button } from '@/components/core/Button';
import { Text } from '@/components/core/Text';
import { Tooltip } from '@/components/core/Tooltip';
import { Transition } from '@/components/core/Transition';
import { useGlobal } from '@/context/globalContext';
import { useSettings } from '@/context/settingsContext';
import { useTheme } from '@/context/themeContext';
import { initialTypingTestValues, useTypingTest } from '@/context/typingTestContext';
import { useWindowEvent } from '@mantine/hooks';
import dayjs from 'dayjs';
import { AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  RiArrowRightLine,
  RiEyeOffFill,
  RiImageFill,
  RiLockFill,
  RiPauseCircleFill,
  RiRefreshLine,
  RiTranslate2,
  RiZzzLine,
} from 'react-icons/ri';
import { Keymap } from './Keymap';
import { Result } from './Result';
import { Sound } from './Sound';
import { Stats } from './Stats';
import { Words } from './Words';

export function Test() {
  const { capsLock, isUserTyping, modalOpened, commandLine, restartTest } = useGlobal();
  const {
    quickRestart,
    blindMode,
    language: languageName,
    stopOnError,
    lazyMode,
    keymap,
    themeType,
    capsLockWarning,
  } = useSettings();
  const { isTestFinished, setValues } = useTypingTest();
  const { colors } = useTheme();
  const [showResultDate, setShowResultDate] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const saveScreenshot = () => {
    setShowResultDate(true);
    setTimeout(() => {
      if (!resultRef.current) return;
      toPng(resultRef.current, {
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
    return () => setValues(initialTypingTestValues);
  }, [setValues]);
  useWindowEvent('keydown', (event) => {
    if (!modalOpened && quickRestart && event.key === (quickRestart === 'tab' ? 'Tab' : 'Escape')) {
      event.preventDefault();
      restartTest();
    }
  });

  return (
    <Transition className='row-start-2 row-end-3' transition={{ duration: 0.075 }}>
      <Sound />
      <AnimatePresence mode='wait'>
        {isTestFinished ? (
          <Transition key='result' className='flex flex-col gap-8' transition={{ duration: 0.075 }}>
            <div ref={resultRef} className='flex flex-col gap-8'>
              <Result />
              {showResultDate && (
                <div className='flex items-end justify-between gap-2'>
                  <Text className='font-[var(--font-lexend-deca)] text-3xl' dimmed>
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
                <Button className='px-8 py-4 text-xl' onClick={restartTest} variant='subtle'>
                  <RiArrowRightLine />
                </Button>
              </Tooltip>
              <Tooltip label='Save screenshot' offset={8}>
                <Button className='px-8 py-4 text-xl' onClick={saveScreenshot} variant='subtle'>
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
                <Transition className='absolute top-0 flex w-full justify-center gap-6'>
                  <Button
                    className='p-0'
                    onClick={() => commandLine.handler.open('language')}
                    variant='text'
                  >
                    <RiTranslate2 />
                    {languageName}
                  </Button>
                  {blindMode && (
                    <Button
                      className='p-0'
                      onClick={() => commandLine.handler.open('blindMode')}
                      variant='text'
                    >
                      <RiEyeOffFill />
                      blind
                    </Button>
                  )}
                  {stopOnError && (
                    <Button
                      className='p-0'
                      onClick={() => commandLine.handler.open('stopOnError')}
                      variant='text'
                    >
                      <RiPauseCircleFill />
                      stop on {stopOnError}
                    </Button>
                  )}
                  {lazyMode && (
                    <Button
                      className='p-0'
                      onClick={() => commandLine.handler.open('lazyMode')}
                      variant='text'
                    >
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
                className='-top-16 absolute inset-x-0 mx-auto w-fit px-3.5 py-3'
                onClick={() => commandLine.handler.open('capsLockWarning')}
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
  );
}
