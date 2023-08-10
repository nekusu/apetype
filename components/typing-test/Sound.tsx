'use client';

import { useDidUpdate } from '@mantine/hooks';
import { useSettings } from 'context/settingsContext';
import { useTypingTest } from 'context/typingTestContext';
import { useSound } from 'hooks/useSound';
import { useRef } from 'react';

export default function Sound() {
  const { blindMode, soundVolume: volume, soundOnClick, soundOnError } = useSettings();
  const { inputValue, currentStats } = useTypingTest();
  const { errors } = currentStats;
  const lastErrorCount = useRef(0);
  const { play: playClick } = useSound(soundOnClick, { volume });
  const { play: playError } = useSound(!blindMode && soundOnError && 'error.webm', { volume });

  useDidUpdate(() => {
    if (errors > lastErrorCount.current) {
      playError();
      lastErrorCount.current = errors;
    } else playClick();
  }, [inputValue]);

  return null;
}
