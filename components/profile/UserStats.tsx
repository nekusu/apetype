'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/core/Table';
import { testsByUserIdOptions } from '@/queries/get-tests-by-user-id';
import { getUserStatsById } from '@/queries/get-user-stats-by-id';
import supabase from '@/utils/supabase/browser';
import { useQuery as useSupabaseQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import { round } from 'radashi';
import { useMemo } from 'react';

interface RowProps {
  label: 'wpm' | 'raw wpm' | 'accuracy' | 'consistency';
  highest?: number;
  avg?: number;
  avgLast?: number;
}

function Row({ label, highest, avg, avgLast }: RowProps) {
  const showPercentage = label === 'accuracy' || label === 'consistency';
  return (
    <TableRow className='text-center text-3xl'>
      <TableCell
        className='!bg-transparent w-0 py-4 pr-10 pl-0 text-left text-2xl text-sub'
        scope='row'
      >
        {label}
      </TableCell>
      <TableCell className='rounded-l-xl'>
        {highest}
        {showPercentage && '%'}
      </TableCell>
      <TableCell>
        {avg}
        {showPercentage && '%'}
      </TableCell>
      {avgLast && (
        <TableCell>
          {avgLast}
          {showPercentage && '%'}
        </TableCell>
      )}
    </TableRow>
  );
}

const orderBy = 'createdAt';
const desc = true;
const lastCount = 10;

export function UserStats({ userId }: { userId: string }) {
  const { data: userStats } = useSupabaseQuery(getUserStatsById(supabase, userId));
  const {
    completedTests = 0,
    avgWpm,
    avgRaw,
    avgAccuracy,
    avgConsistency,
    highestWpm,
    highestRaw,
    highestAccuracy,
    highestConsistency,
  } = userStats ?? {};
  const { data } = useInfiniteQuery(
    testsByUserIdOptions(supabase, userId, { orderBy, desc, pageSize: lastCount }),
  );
  const lastTests = data?.pages[0].data;
  const { avgLastWpm, avgLastRaw, avgLastAccuracy, avgLastConsistency } = useMemo(() => {
    if (!lastTests || completedTests <= lastCount) return {};
    const { length } = lastTests;
    const wpm = lastTests.reduce((acc, { wpm }) => acc + wpm, 0) / length;
    const raw = lastTests.reduce((acc, { raw }) => acc + raw, 0) / length;
    const accuracy = lastTests.reduce((acc, { accuracy }) => acc + accuracy, 0) / length;
    const consistency = lastTests.reduce((acc, { consistency }) => acc + consistency, 0) / length;
    return {
      avgLastWpm: round(wpm, 2),
      avgLastRaw: round(raw, 2),
      avgLastAccuracy: round(accuracy, 2),
      avgLastConsistency: round(consistency, 2),
    };
  }, [completedTests, lastTests]);

  return (
    <Table>
      <TableHeader>
        <TableRow className='text-2xl'>
          <th />
          <TableHead className='py-3' scope='col'>
            highest
          </TableHead>
          <TableHead className='py-3' scope='col'>
            average
          </TableHead>
          {lastTests && completedTests > lastCount && (
            <TableHead className='py-1.5'>
              <div className='flex flex-col gap-0.5 leading-none'>
                average
                <span className='text-xs'>(last {lastCount} tests)</span>
              </div>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        <Row label='wpm' highest={highestWpm} avg={avgWpm} avgLast={avgLastWpm} />
        <Row label='raw wpm' highest={highestRaw} avg={avgRaw} avgLast={avgLastRaw} />
        <Row
          label='accuracy'
          highest={highestAccuracy}
          avg={avgAccuracy}
          avgLast={avgLastAccuracy}
        />
        <Row
          label='consistency'
          highest={highestConsistency}
          avg={avgConsistency}
          avgLast={avgLastConsistency}
        />
      </TableBody>
    </Table>
  );
}
