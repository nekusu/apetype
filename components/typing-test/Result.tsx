'use client';

import { Text, Tooltip } from 'components/core';
import { useAuth } from 'context/authContext';
import { useSettings } from 'context/settingsContext';
import { useTypingTest } from 'context/typingTestContext';
import { useUser } from 'context/userContext';
import { useLanguage } from 'hooks/useLanguage';
import {
  Fragment,
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { RiVipCrown2Fill } from 'react-icons/ri';
import { twJoin, twMerge } from 'tailwind-merge';
import { Letter as LetterType, accuracy as acc, consistency as con } from 'utils/typingTest';
import { PersonalBest, getPersonalBest, isPersonalBest } from 'utils/user';
import { Chart, Letter } from '.';

interface GroupProps {
  title: string | number | ReactElement<HTMLElement, string | JSXElementConstructor<HTMLElement>>;
  titleClassName?: string;
  value: ReactNode | ReactNode[];
  valueClassName?: string;
}

function Group({ title, titleClassName, value, valueClassName }: GroupProps) {
  if (!Array.isArray(value)) value = [value];

  return (
    <div className='flex flex-col gap-1'>
      <Text
        asChild={typeof title === 'object'}
        className={twMerge(
          'text-[1rem] !leading-none',
          titleClassName,
          typeof title === 'object' && title.props.className,
        )}
        dimmed
      >
        {title}
      </Text>
      <div
        className={twJoin(
          'flex leading-none text-main text-[2rem] transition-colors',
          valueClassName,
        )}
      >
        {(value as ReactNode[]).map((value, index) =>
          ['string', 'number'].includes(typeof value) ? <div key={index}>{value}</div> : value,
        )}
      </div>
    </div>
  );
}

export default function Result() {
  const {
    mode,
    blindMode,
    language: languageName,
    stopOnError,
    lazyMode,
    showDecimalPlaces,
    ...settings
  } = useSettings();
  const { time, words: wordAmount } = settings;
  const { signedIn } = useAuth();
  const { user, setPendingData, pendingData } = useUser();
  const { words, currentStats, stats, elapsedTime } = useTypingTest();
  const { raw, wpm, characters, errors } = currentStats;
  const { language } = useLanguage(languageName);
  const accuracy = acc(characters, errors);
  const consistency = useMemo(() => con(stats.raw), [stats.raw]);
  const characterStats = useMemo(() => {
    return words.reduce(
      (characters, word) => {
        word.letters.forEach(({ status }) => {
          if (!status) return;
          if (status === 'correct') {
            if (word.isCorrect) characters.correct++;
          } else characters[status]++;
        });
        return characters;
      },
      { correct: 0, incorrect: 0, extra: 0, missed: 0 },
    );
  }, [words]);
  const [newRecord, setNewRecord] = useState(0);

  useEffect(() => {
    setPendingData((draft) => {
      const { typingStats, tests } = draft;
      const currentStats = { wpm, raw, accuracy, consistency };
      typingStats.completedTests += 1;
      Object.entries(currentStats).forEach(([_key, value]) => {
        const key = _key as keyof typeof currentStats;
        if (value > typingStats.highest[key]) typingStats.highest[key] = value;
        typingStats.accumulated[key] += value;
      });
      const newTest = {
        language: languageName,
        date: new Date(),
        mode,
        mode2: settings[mode],
        words,
        stats,
        result: { ...currentStats, characterStats },
        duration: elapsedTime,
        blindMode,
        lazyMode,
        isPb: false,
      };
      newTest.isPb = user ? isPersonalBest(user, newTest, pendingData.tests) : false;
      tests.push(newTest);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    let personalBest: PersonalBest | undefined;
    if (user) personalBest = getPersonalBest(user, mode, settings[mode], pendingData.tests);
    if (!personalBest || wpm > personalBest.wpm)
      setNewRecord(personalBest ? wpm - personalBest.wpm : wpm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className='flex flex-col cursor-default gap-5'>
      <div className='grid grid-cols-[min-content_1fr] items-center gap-5'>
        <div className='flex flex-wrap gap-2'>
          <Group
            title={
              <div className='flex items-center gap-3 text-[2rem]'>
                wpm
                {signedIn && newRecord > 0 && (
                  <Tooltip label={`+${newRecord.toFixed(2)}`} placement='top'>
                    <div className='rounded-xl bg-main p-2 text-base text-sub-alt'>
                      <RiVipCrown2Fill />
                    </div>
                  </Tooltip>
                )}
              </div>
            }
            value={showDecimalPlaces ? wpm.toFixed(2) : Math.floor(wpm)}
            valueClassName='text-[4rem]'
          />
          <Group
            title='acc'
            titleClassName='text-[2rem]'
            value={`${showDecimalPlaces ? accuracy.toFixed(2) : Math.floor(accuracy)}%`}
            valueClassName='text-[4rem]'
          />
        </div>
        <Chart stats={stats} elapsedTime={elapsedTime} />
      </div>
      <div className='flex justify-between gap-5'>
        <Group
          title='test type'
          value={[
            `${mode} ${mode === 'time' ? time : mode === 'words' ? wordAmount : ''}`,
            languageName,
            blindMode && 'blind',
            stopOnError && `stop on ${stopOnError}`,
            lazyMode && !language?.noLazyMode && 'lazy',
          ]}
          valueClassName='text-base flex-col'
        />
        <Group title='raw' value={showDecimalPlaces ? raw.toFixed(2) : Math.floor(raw)} />
        <Group
          title='characters'
          value={Object.entries(characterStats).map(([status, count]) => (
            <Fragment key={status}>
              <Tooltip label={status} placement='top'>
                <Letter status={status as LetterType['status']} original={count.toString()} />
              </Tooltip>
              <span className='last:hidden'>/</span>
            </Fragment>
          ))}
        />
        <Group
          title='consistency'
          value={`${showDecimalPlaces ? consistency.toFixed(2) : Math.floor(consistency)}%`}
        />
        <Group title='time' value={`${elapsedTime}s`} />
      </div>
    </div>
  );
}
