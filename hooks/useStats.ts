import { useSettings } from '@/context/settingsContext';
import { useTypingTest } from '@/context/typingTestContext';
import { useInterval } from '@mantine/hooks';
import { round } from 'radashi';
import { useCallback, useEffect, useRef } from 'react';

export function useStats() {
  const { mode, time } = useSettings();
  const { setValues } = useTypingTest();
  const lastCharacterCount = useRef(0);

  const update = useCallback(() => {
    setValues((draft) => {
      const { words, wordIndex, stats, chartData, timer, startTime, elapsedTime } = draft;
      const timestamp = performance.now();
      let rawInput = '';
      let wpmInput = '';

      for (const word of words.slice(0, wordIndex + 1)) {
        const typed = ` ${word.typed ?? ''}`;
        rawInput += typed;
        if (word.isCorrect) {
          wpmInput += typed;
        }
      }

      rawInput = rawInput.trim();
      wpmInput = wpmInput.trim();

      const newElapsedTime = round((timestamp - startTime) / 1000, 2);
      const characters = stats.characters - lastCharacterCount.current;
      const errors = stats.errors - chartData.errors.reduce((a, b) => a + b, 0);
      const currentRaw = characters / 5 / ((newElapsedTime - elapsedTime) / 60);
      const raw = rawInput.length / 5 / (newElapsedTime / 60);
      const wpm = wpmInput.length / 5 / (newElapsedTime / 60);

      lastCharacterCount.current = stats.characters;
      stats.raw = raw;
      stats.wpm = wpm;
      chartData.raw.push(currentRaw);
      chartData.wpm.push(wpm);
      chartData.errors.push(errors);
      draft.timer = mode === 'time' ? timer - 1 : timer;
      draft.elapsedTime = newElapsedTime;
    });
  }, [mode, setValues]);

  const interval = useInterval(update, 1000);

  const start = useCallback(() => {
    const timestamp = performance.now();
    setValues((draft) => {
      draft.startTime = timestamp;
      draft.timer = mode === 'time' ? time : 0;
    });
    interval.start();
  }, [interval, mode, setValues, time]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: not needed
  useEffect(() => {
    return interval.stop;
  }, []);
  useEffect(() => {
    setValues((draft) => {
      draft.timer = mode === 'time' ? time : 0;
    });
  }, [mode, setValues, time]);

  return { start, update };
}
