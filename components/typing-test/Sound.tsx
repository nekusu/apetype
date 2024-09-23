'use client';

import { useSettings } from '@/context/settingsContext';
import { useTypingTest } from '@/context/typingTestContext';
import { useSound } from '@/hooks/useSound';
import { useDidUpdate } from '@mantine/hooks';
import { useRef } from 'react';

export function Sound() {
  const { blindMode, soundVolume: volume, soundOnClick, soundOnError } = useSettings();
  const {
    inputValue,
    stats: { errors },
  } = useTypingTest();
  const lastErrorCount = useRef(0);
  const { play: playClick } = useSound(soundOnClick, { volume });
  const { play: playError } = useSound(soundOnError && 'error.webm', { volume });

  useDidUpdate(() => {
    if (!blindMode && errors > lastErrorCount.current) {
      playError();
      lastErrorCount.current = errors;
    } else playClick();
  }, [inputValue, errors]);

  return null;
}
