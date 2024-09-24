'use client';

import { Button } from '@/components/core/Button';
import { DataTable } from '@/components/core/DataTable';
import { Modal } from '@/components/core/Modal';
import { Tooltip } from '@/components/core/Tooltip';
import { Chart } from '@/components/typing-test/Chart';
import type { ChartProps } from '@/components/typing-test/Chart';
import { testsByUserIdOptions } from '@/queries/get-tests-by-user-id';
import { getUserStatsById } from '@/queries/get-user-stats-by-id';
import supabase from '@/utils/supabase/browser';
import { useDisclosure } from '@mantine/hooks';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { SortingState } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { capitalize } from 'radashi';
import { type ComponentPropsWithoutRef, type ReactNode, useState } from 'react';
import {
  RiEyeOffFill,
  RiLineChartFill,
  RiTranslate2,
  RiVipCrownFill,
  RiZzzFill,
} from 'react-icons/ri';

interface InfoIconProps extends ComponentPropsWithoutRef<'div'> {
  label: string;
  icon: ReactNode;
}

function InfoIcon({ label, icon, ...props }: InfoIconProps) {
  return (
    <Tooltip label={label}>
      <div {...props}>{icon}</div>
    </Tooltip>
  );
}

export function TestHistory({ userId }: { userId: string }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const { id: orderBy, desc } = sorting[0];
  const { data: userStats } = useQuery(getUserStatsById(supabase, userId));
  const { completedTests = 0 } = userStats ?? {};
  const { data, fetchNextPage, isFetchingNextPage, isFetching } = useInfiniteQuery(
    testsByUserIdOptions(supabase, userId, { orderBy, desc }),
  );
  const tests = data?.pages.flatMap((page) => page.data as NonNullable<typeof page.data>);
  const [chartData, setChartData] = useState<ChartProps>();
  const [chartModalOpened, chartModalHandler] = useDisclosure(false);

  if (!tests) return null;

  return (
    <>
      <DataTable
        columns={[
          {
            id: 'pb',
            header: '',
            cell: ({
              row: {
                original: { isPb },
              },
            }) =>
              isPb && (
                <div className='flex justify-center text-main transition-colors'>
                  <RiVipCrownFill />
                </div>
              ),
          },
          { accessorKey: 'wpm', enableSorting: true },
          { accessorKey: 'raw', enableSorting: true },
          {
            id: 'accuracy',
            accessorFn: ({ accuracy }) => `${accuracy}%`,
            enableSorting: true,
          },
          {
            id: 'consistency',
            accessorFn: ({ consistency }) => `${consistency}%`,
            enableSorting: true,
          },
          {
            id: 'charStats',
            header: () => (
              <Tooltip label='correct/incorrect/extra/missed' placement='top'>
                <div className='-mx-3 -my-2 cursor-pointer p-[inherit]'>chars</div>
              </Tooltip>
            ),
            accessorFn: ({ charStats }) => charStats.join('/'),
          },
          { id: 'mode', accessorFn: ({ mode, mode2 }) => `${mode} ${mode2}` },
          {
            id: 'info',
            header: 'info',
            cell: ({
              row: {
                original: { language, blindMode, lazyMode, chartData, duration },
              },
            }) => (
              <div className='flex gap-2'>
                <InfoIcon label={capitalize(language)} icon={<RiTranslate2 />} />
                {blindMode && <InfoIcon label='Blind mode' icon={<RiEyeOffFill />} />}
                {lazyMode && <InfoIcon label='Lazy mode' icon={<RiZzzFill />} />}
                <Tooltip label='View chart'>
                  <Button
                    className='p-0 text-text hover:text-main focus-visible:text-main'
                    onClick={() => {
                      setChartData({ chartData, elapsedTime: duration });
                      chartModalHandler.open();
                    }}
                    variant='text'
                  >
                    <RiLineChartFill />
                  </Button>
                </Tooltip>
              </div>
            ),
          },
          {
            id: 'createdAt',
            header: 'date',
            accessorFn: ({ createdAt }) => dayjs(createdAt).format('DD MMM YYYY HH:mm'),
            enableSorting: true,
          },
        ]}
        data={tests}
        state={{ sorting }}
        onSortingChange={setSorting}
        loading={isFetching && !isFetchingNextPage}
        stickyHeader
      />
      {tests.length < completedTests && (
        <Button
          className='-mt-4 mx-auto min-w-[25%]'
          loading={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          load more
        </Button>
      )}
      <Modal
        backdropClassName='overflow-hidden'
        className='w-3xl'
        opened={chartModalOpened}
        onClose={chartModalHandler.close}
        overflow='outside'
        trapFocus={false}
      >
        {chartData && <Chart {...chartData} />}
      </Modal>
    </>
  );
}
