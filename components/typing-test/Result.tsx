'use client';

import { Grid } from '@/components/core/Grid';
import { Text } from '@/components/core/Text';
import { Tooltip } from '@/components/core/Tooltip';
import { useSettings } from '@/context/settingsContext';
import { useTypingTest } from '@/context/typingTestContext';
import {
  type Letter as LetterType,
  accuracy as acc,
  calculateCharStats,
  consistency as con,
} from '@/utils/typingTest';
import {
  Fragment,
  type JSXElementConstructor,
  type ReactElement,
  type ReactNode,
  useMemo,
} from 'react';
import { RiVipCrownFill } from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';
import { Chart } from './Chart';
import { Letter } from './Letter';

interface StatProps {
  title: string | number | ReactElement<HTMLElement, string | JSXElementConstructor<HTMLElement>>;
  titleClassName?: string;
  value: ReactNode | ReactNode[];
  valueClassName?: string;
  tooltipLabel?: ReactNode;
}

function Stat({ title, titleClassName, value, valueClassName, tooltipLabel }: StatProps) {
  if (!Array.isArray(value)) value = [value];

  return (
    <div className='flex flex-col items-start gap-1'>
      <Text
        asChild={typeof title === 'object'}
        className={twJoin('!leading-none', titleClassName)}
        dimmed
      >
        {title}
      </Text>
      <Tooltip label={tooltipLabel} disabled={!tooltipLabel}>
        <div
          className={twJoin('flex text-[2rem]/none text-main transition-colors', valueClassName)}
        >
          {(value as ReactNode[]).map((value) =>
            typeof value === 'string' || typeof value === 'number' ? (
              <div key={value}>{value}</div>
            ) : (
              value
            ),
          )}
        </div>
      </Tooltip>
    </div>
  );
}

export function Result() {
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
  const { language, words, stats, chartData, elapsedTime, isPb } = useTypingTest();
  const { raw, wpm, characters, errors } = stats;
  const accuracy = acc(characters, errors);
  const consistency = useMemo(() => con(chartData.raw), [chartData.raw]);
  const charStats = useMemo(() => calculateCharStats(words), [words]);

  return (
    <div className='flex cursor-default flex-col gap-5'>
      <Grid className='grid-cols-[min-content_1fr] items-center gap-5'>
        <div className='flex flex-wrap gap-2'>
          <Stat
            title={
              <div className='flex items-center gap-3 text-[2rem]'>
                wpm
                {isPb && (
                  <Tooltip label='New record!' placement='top'>
                    <div className='rounded-xl bg-main p-2 text-base text-sub-alt'>
                      <RiVipCrownFill />
                    </div>
                  </Tooltip>
                )}
              </div>
            }
            value={showDecimalPlaces ? wpm.toFixed(2) : Math.floor(wpm)}
            valueClassName='text-[4rem]'
            tooltipLabel={!showDecimalPlaces && wpm.toFixed(2)}
          />
          <Stat
            title='acc'
            titleClassName='text-[2rem]'
            value={`${showDecimalPlaces ? accuracy.toFixed(2) : Math.floor(accuracy)}%`}
            valueClassName='text-[4rem]'
            tooltipLabel={!showDecimalPlaces && `${accuracy.toFixed(2)}%`}
          />
        </div>
        <Chart chartData={chartData} elapsedTime={elapsedTime} />
      </Grid>
      <div className='flex justify-between gap-5'>
        <Stat
          title='test type'
          value={[
            `${mode} ${mode === 'time' ? time : mode === 'words' ? wordAmount : ''}`,
            languageName,
            blindMode && 'blind',
            stopOnError && `stop on ${stopOnError}`,
            lazyMode && !language?.noLazyMode && 'lazy',
          ]}
          valueClassName='text-[1rem] flex-col'
        />
        <Stat
          title='raw'
          value={showDecimalPlaces ? raw.toFixed(2) : Math.floor(raw)}
          tooltipLabel={!showDecimalPlaces && raw.toFixed(2)}
        />
        <Stat
          title='characters'
          value={Object.entries(charStats).map(([status, count]) => (
            <Fragment key={status}>
              <Tooltip label={status}>
                <Letter status={status as LetterType['status']} original={count.toString()} />
              </Tooltip>
              <span className='last:hidden'>/</span>
            </Fragment>
          ))}
        />
        <Stat
          title='consistency'
          value={`${showDecimalPlaces ? consistency.toFixed(2) : Math.floor(consistency)}%`}
          tooltipLabel={!showDecimalPlaces && `${consistency.toFixed(2)}%`}
        />
        <Stat title='time' value={`${elapsedTime}s`} />
      </div>
    </div>
  );
}
