import { useInterval } from '@mantine/hooks';
import { useSettings } from 'context/settingsContext';
import { useTypingTest } from 'context/typingTestContext';
import { useEffect } from 'react';

export function useStats() {
  const { mode, time } = useSettings();
  const { setValues } = useTypingTest();
  const interval = useInterval(() => update(), 1000);

  const start = () => {
    const timestamp = performance.now();
    setValues((draft) => {
      draft.startTime = timestamp;
      draft.timer = mode === 'time' ? time : 0;
    });
    interval.start();
  };

  const update = () => {
    setValues((draft) => {
      const { words, wordIndex, currentStats, stats, timer, startTime, elapsedTime } = draft;
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

      const newElapsedTime = +((timestamp - startTime) / 1000).toFixed(2);
      const characters = currentStats.characters - stats.characters.reduce((a, b) => a + b, 0);
      const errors = currentStats.errors - stats.errors.reduce((a, b) => a + b, 0);
      const currentRaw = characters / 5 / ((newElapsedTime - elapsedTime) / 60);
      const raw = rawInput.length / 5 / (newElapsedTime / 60);
      const wpm = wpmInput.length / 5 / (newElapsedTime / 60);

      currentStats.raw = raw;
      currentStats.wpm = wpm;
      stats.raw.push(currentRaw);
      stats.wpm.push(wpm);
      stats.characters.push(characters);
      stats.errors.push(errors);
      draft.timer = mode === 'time' ? timer - 1 : timer;
      draft.elapsedTime = newElapsedTime;
    });
  };

  useEffect(() => {
    return interval.stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { start, update };
}
