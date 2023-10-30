'use client';

import { useIntersection, useIsomorphicEffect } from '@mantine/hooks';
import { useGetDocs } from '@tatsuokaniwa/swr-firestore';
import { TypingTest, User } from 'context/userContext';
import { useMemo, useRef, useState } from 'react';

export interface UserStatsProps {
  userId?: string;
  completedTests?: number;
  highest?: User['typingStats']['highest'];
  average?: User['typingStats']['average'];
}

const STAT_LABELS = ['wpm', 'raw', 'accuracy', 'consistency'] as const;

export default function UserStats({
  userId,
  completedTests = 0,
  highest,
  average,
}: UserStatsProps) {
  const tableRef = useRef<HTMLTableElement>(null);
  const { ref, entry } = useIntersection({ root: tableRef.current, threshold: 0.1 });
  const [onScreen, setOnScreen] = useState(false);
  const { data: lastTests } = useGetDocs<TypingTest>(
    userId && completedTests > 10 && onScreen
      ? { path: `users/${userId}/tests`, orderBy: [['date', 'desc']], limit: 10 }
      : null,
  );
  const averageLast = useMemo<UserStatsProps['average']>(() => {
    return lastTests?.reduce(
      (stats, test, index) => {
        Object.keys(stats).map((_key) => {
          const key = _key as keyof typeof stats;
          stats[key] += test.result[key];
          if (index > 0) stats[key] /= 2;
        });
        return stats;
      },
      { wpm: 0, raw: 0, accuracy: 0, consistency: 0 },
    );
  }, [lastTests]);

  useIsomorphicEffect(() => {
    if (entry?.isIntersecting) setOnScreen(true);
  }, [entry?.isIntersecting]);

  return (
    <table ref={ref} className='border-spacing-none cursor-default'>
      <thead>
        <tr className='text-2xl text-sub transition-colors'>
          <th />
          <th className='py-3 font-normal' scope='col'>
            highest
          </th>
          <th className='py-3 font-normal' scope='col'>
            average
          </th>
          {averageLast && (
            <th
              className='flex flex-col items-center justify-center gap-1 py-2 font-normal leading-none'
              scope='col'
            >
              average
              <span className='text-xs'>(last {lastTests?.length} tests)</span>
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {STAT_LABELS.map((label) => {
          const showPercentage = ['accuracy', 'consistency'].includes(label) && '%';
          return (
            <tr
              key={label}
              className='text-center text-3xl text-text transition-colors odd:bg-sub-alt'
            >
              <td
                className='w-0 bg-bg py-4 pr-8 text-left text-2xl text-sub transition-colors'
                scope='row'
              >
                {label}
              </td>
              <td className='rounded-l-xl'>
                {highest?.[label]?.toFixed(2)}
                {showPercentage}
              </td>
              <td className='last:rounded-r-xl'>
                {average?.[label]?.toFixed(2)}
                {showPercentage}
              </td>
              {averageLast && (
                <td className='rounded-r-xl'>
                  {averageLast?.[label]?.toFixed(2)}
                  {showPercentage}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
