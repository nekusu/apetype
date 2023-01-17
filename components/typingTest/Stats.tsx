'use client';

import { FloatingPortal } from '@floating-ui/react';
import { useDidUpdate } from '@mantine/hooks';
import { Transition } from 'components/core';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { useTypingTest } from 'context/typingTestContext';
import { motion } from 'framer-motion';
import { useStats } from 'hooks/useStats';
import { accuracy as acc } from 'utils/typingTest';

export default function Stats() {
  const { restartTest } = useGlobal();
  const { mode, time, words, timerProgressStyle, statsColor, statsOpacity, fontSize } =
    useSettings();
  const { wordIndex, currentStats, timer, isTestRunning } = useTypingTest();
  const { wpm, characters, errors } = currentStats;
  const stats = useStats();
  const accuracy = acc(characters, errors);
  useDidUpdate(() => {
    if (isTestRunning) stats.start();
  }, [isTestRunning]);
  useDidUpdate(() => {
    const timeFinished = mode === 'time' && time > 0 && timer <= 0;
    const wordsFinished = mode === 'words' && words > 0 && wordIndex >= words;
    if (timeFinished || wordsFinished) restartTest();
  }, [timer, wordIndex]);

  return (
    <div className='select-none' style={{ height: `${fontSize}rem` }}>
      {isTestRunning && (
        <Transition>
          <motion.div
            className='flex leading-none transition-colors'
            style={{
              gap: `${fontSize * 1.25}rem`,
              color: `var(--${statsColor}-color)`,
              opacity: statsOpacity,
              fontSize: `${fontSize}rem`,
            }}
          >
            {['text', 'both'].includes(timerProgressStyle) && (
              <div>
                {mode === 'time' ? (
                  Math.abs(timer)
                ) : (
                  <>
                    {wordIndex}
                    {!!words && `/${words}`}
                  </>
                )}
              </div>
            )}
            <div>{Math.floor(wpm)}</div>
            <div>{Math.floor(accuracy)}%</div>
          </motion.div>
        </Transition>
      )}
      <FloatingPortal>
        {isTestRunning && ['bar', 'both'].includes(timerProgressStyle) && (
          <motion.div
            className='fixed inset-x-0 top-0 h-2 transition-colors'
            style={{ background: `var(--${statsColor}-color)`, opacity: statsOpacity }}
            initial={{ width: mode === 'time' ? '100%' : 0 }}
            animate={{
              width: mode === 'words' ? `${(wordIndex / words) * 100}%` : 0,
              transition: {
                width: {
                  duration: mode === 'time' ? time : 0.25,
                  ease: mode === 'time' ? 'linear' : 'easeInOut',
                },
              },
            }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          />
        )}
      </FloatingPortal>
    </div>
  );
}
