'use client';

import { Group } from 'components/core';
import { useSettings } from 'context/settingsContext';
import { useTypingTest } from 'context/typingTestContext';
import { useMemo } from 'react';
import { accuracy as acc, consistency as con } from 'utils/typingTest';
import Chart from './Chart';

export default function Result() {
  const { mode, time, words: wordAmount, showDecimalPlaces } = useSettings();
  const { language, words, currentStats, stats, elapsedTime } = useTypingTest();
  const { raw, wpm, characters, errors } = currentStats;
  const accuracy = acc(characters, errors);
  const consistency = useMemo(() => con(stats.raw), [stats.raw]);
  const characterStats = useMemo(() => {
    return words.reduce(
      (characters, word) => {
        word.letters.forEach(({ status }) => {
          if (!status) return;
          if (status === 'correct') {
            if (word.isCorrect) characters.correct++;
          } else {
            characters[status]++;
          }
        });
        return characters;
      },
      { correct: 0, incorrect: 0, extra: 0, missed: 0 }
    );
  }, [words]);

  return (
    <div className='grid cursor-default grid-cols-[min-content_1fr] grid-rows-[fit-content_1fr] items-center gap-5'>
      <div className='flex flex-wrap gap-2'>
        <Group
          title='wpm'
          titleSize='md'
          values={showDecimalPlaces ? +wpm.toFixed(2) : Math.floor(wpm)}
          valueSize='lg'
        />
        <Group
          title='acc'
          titleSize='md'
          values={`${showDecimalPlaces ? +accuracy.toFixed(2) : Math.floor(accuracy)}%`}
          valueSize='lg'
        />
      </div>
      <Chart />
      <div className='col-span-full flex justify-between gap-5'>
        <Group
          title='test type'
          values={[
            `${mode} ${mode === 'time' ? time : mode === 'words' ? wordAmount : ''}`,
            language?.name,
          ]}
          valueSize='sm'
        />
        <Group title='raw' values={showDecimalPlaces ? +raw.toFixed(2) : Math.floor(raw)} />
        <Group title='characters' values={Object.values(characterStats).join('/')} />
        <Group
          title='consistency'
          values={`${showDecimalPlaces ? +consistency.toFixed(2) : Math.floor(consistency)}%`}
        />
        <Group title='time' values={`${elapsedTime}s`} />
      </div>
    </div>
  );
}
