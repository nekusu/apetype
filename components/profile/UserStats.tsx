'use client';

import { useIntersection, useIsomorphicEffect } from '@mantine/hooks';
import { useGetDocs } from '@tatsuokaniwa/swr-firestore';
import { useMemo, useRef, useState } from 'react';
import { RiLoaderLine } from 'react-icons/ri';
import { TypingTest, User } from 'utils/user';

export type UserStatsProps =
  | { user: User; highest?: undefined; average?: undefined }
  | ({ user?: undefined } & Pick<User['typingStats'], 'highest' | 'average'>);

const STAT_LABELS = ['wpm', 'raw', 'accuracy', 'consistency'] as const;

export default function UserStats({ user, ...props }: UserStatsProps) {
  const { highest, average } = user?.typingStats ?? props;
  const { completedTests = 0 } = user?.typingStats ?? {};
  const tableRef = useRef<HTMLTableElement>(null);
  const { ref, entry } = useIntersection({ root: tableRef.current, threshold: 0.1 });
  const [onScreen, setOnScreen] = useState(false);
  const { data: lastTests, isLoading } = useGetDocs<TypingTest>(
    user && completedTests > 10 && onScreen
      ? { path: `users/${user.id}/tests`, orderBy: [['date', 'desc']], limit: 10 }
      : null,
    { revalidateIfStale: false },
  );
  const averageLast = useMemo<UserStatsProps['average']>(() => {
    if (!lastTests) return;
    const stats = { wpm: 0, raw: 0, accuracy: 0, consistency: 0 };
    type Key = keyof typeof stats;
    lastTests.forEach((test) => {
      for (const _key in stats) {
        const key = _key as Key;
        stats[key] += test.result[key];
      }
    });
    for (const key in stats) stats[key as Key] /= lastTests.length;
    return stats;
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
          {completedTests > 10 && (
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
            <tr key={label} className='group text-center text-3xl text-text transition-colors'>
              <td
                className='w-0 py-4 pr-8 text-left text-2xl text-sub transition-colors'
                scope='row'
              >
                {label}
              </td>
              <td className='rounded-l-xl group-odd:bg-sub-alt'>
                {highest?.[label]?.toFixed(2)}
                {showPercentage}
              </td>
              <td className='last:rounded-r-xl group-odd:bg-sub-alt'>
                {average?.[label]?.toFixed(2)}
                {showPercentage}
              </td>
              {completedTests > 10 && (
                <td className='rounded-r-xl group-odd:bg-sub-alt'>
                  {isLoading ? (
                    <span className='flex justify-center'>
                      <RiLoaderLine className='animate-spin' />
                    </span>
                  ) : (
                    <>
                      {averageLast?.[label]?.toFixed(2)}
                      {showPercentage}
                    </>
                  )}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
