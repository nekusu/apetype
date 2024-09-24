'use client';

import { Button } from '@/components/core/Button';
import { DataTable } from '@/components/core/DataTable';
import { Group } from '@/components/core/Group';
import { Modal } from '@/components/core/Modal';
import { Text } from '@/components/core/Text';
import { Tooltip } from '@/components/core/Tooltip';
import { useSettings } from '@/context/settingsContext';
import { getPersonalBestsByUserId } from '@/queries/get-pb-by-user-id';
import supabase from '@/utils/supabase/browser';
import { useDisclosure } from '@mantine/hooks';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { getSortedRowModel } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { max, objectify } from 'radashi';
import { useMemo, useState } from 'react';
import { RiCheckFill, RiMore2Fill } from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';

type PersonalBest = Exclude<
  Awaited<ReturnType<typeof getPersonalBestsByUserId>>['data'],
  null
>[number];
interface PersonalBestProps {
  mode: (typeof MODES)[number];
  amount: number;
  data?: PersonalBest | null;
}

const MODES = ['time', 'words'] as const;

function PersonalBest({ mode, amount, data }: PersonalBestProps) {
  const { raw, wpm, accuracy, consistency, createdAt } = data ?? {};
  const testType = (
    <Text className='text-center text-sm' dimmed>
      {amount} {mode === 'time' ? 'seconds' : 'words'}
    </Text>
  );

  return (
    <div className='group relative flex h-[116px] items-center justify-center'>
      {data && (
        <div
          key='full'
          className='absolute inset-0 flex flex-col items-center justify-center gap-0.5 opacity-0 transition group-hover:opacity-100'
        >
          {testType}
          <div className='flex flex-col items-center gap-0.5 [&>*]:text-center [&>*]:text-xs'>
            <Text>{wpm} wpm</Text>
            <Text>{raw} raw</Text>
            <Text>{accuracy} acc</Text>
            <Text>{consistency} con</Text>
          </div>
          <Text className='text-center text-sm' dimmed>
            {dayjs(createdAt).format('DD MMM YYYY')}
          </Text>
        </div>
      )}
      <div
        className={twJoin(
          'absolute inset-0 flex flex-col items-center justify-center gap-1',
          data && 'transition group-hover:opacity-0',
        )}
      >
        {testType}
        <Text className='text-4xl leading-tight'>{wpm ? Math.floor(wpm) : '-'}</Text>
        <Text className='text-2xl leading-tight opacity-50'>
          {accuracy ? `${Math.floor(accuracy)}%` : '-'}
        </Text>
      </div>
    </div>
  );
}

export function PersonalBests({ userId }: { userId: string }) {
  const { settingsReference } = useSettings();
  const { data } = useQuery(getPersonalBestsByUserId(supabase, userId));
  const [modalOpened, modalHandler] = useDisclosure(false);
  const [selectedMode, setSelectedMode] = useState<(typeof MODES)[number]>('time');
  const personalBests = useMemo(() => {
    const personalBests = objectify(
      MODES,
      (mode) => mode,
      () => [] as PersonalBest[],
    );
    for (const pb of data ?? [])
      for (const mode of MODES) if (pb.mode === mode) personalBests[mode].push(pb);
    return personalBests;
  }, [data]);

  return (
    <>
      <Group className='cursor-default gap-6'>
        {MODES.map((mode) => (
          <Group key={mode} className='relative gap-4 rounded-xl bg-sub-alt p-4 transition-colors'>
            {settingsReference[mode].options.map(({ value }) => {
              const filtered = personalBests[mode].filter(({ mode2 }) => +mode2 === value);
              return (
                <PersonalBest
                  key={`${mode}-${value}`}
                  mode={mode}
                  amount={value}
                  data={max(filtered, ({ wpm }) => wpm)}
                />
              );
            })}
            {!!personalBests[mode].length && (
              <Tooltip className='bg-bg' label='Show all personal bests' placement='left'>
                <Button
                  className='absolute top-0 right-0 bottom-0 rounded-r-xl rounded-l-none px-0.5 active:scale-none'
                  onClick={() => {
                    setSelectedMode(mode);
                    modalHandler.open();
                  }}
                >
                  <RiMore2Fill size={24} />
                </Button>
              </Tooltip>
            )}
          </Group>
        ))}
      </Group>
      <Modal
        className='min-w-5xl'
        trapFocus={false}
        opened={modalOpened}
        onClose={modalHandler.close}
      >
        <DataTable
          columns={[
            {
              accessorKey: 'mode2',
              header: selectedMode,
              enableSorting: true,
              sortDescFirst: false,
              sortingFn: 'alphanumeric',
            },
            { accessorKey: 'wpm', enableSorting: true, sortingFn: 'alphanumeric' },
            { accessorKey: 'raw', enableSorting: true, sortingFn: 'alphanumeric' },
            {
              id: 'accuracy',
              accessorFn: ({ accuracy }) => `${accuracy}%`,
              enableSorting: true,
              sortingFn: 'alphanumeric',
            },
            {
              id: 'consistency',
              accessorFn: ({ consistency }) => `${consistency}%`,
              enableSorting: true,
              sortingFn: 'alphanumeric',
            },
            { accessorKey: 'language' },
            {
              id: 'lazyMode',
              header: 'lazy mode',
              cell: ({
                row: {
                  original: { lazyMode },
                },
              }) => lazyMode && <RiCheckFill size={20} />,
            },
            {
              id: 'createdAt',
              header: 'date',
              accessorFn: ({ createdAt }) => dayjs(createdAt).format('DD MMM YYYY HH:mm'),
              enableSorting: true,
              sortingFn: 'datetime',
            },
          ]}
          data={personalBests[selectedMode]}
          idPrefix='pb'
          idProperty='testId'
          manualSorting={false}
          initialState={{
            sorting: [
              { id: 'mode2', desc: false },
              { id: 'wpm', desc: true },
            ],
          }}
          getSortedRowModel={getSortedRowModel()}
        />
      </Modal>
    </>
  );
}
