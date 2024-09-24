'use client';

import { Group } from '@/components/core/Group';
import { Text } from '@/components/core/Text';
import { useSettings } from '@/context/settingsContext';
import { getPersonalBestsByUserId } from '@/queries/get-pb-by-user-id';
import type { Settings } from '@/utils/settings';
import supabase from '@/utils/supabase/browser';
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import dayjs from 'dayjs';
import { twJoin } from 'tailwind-merge';

type PersonalBest = Exclude<
  Awaited<ReturnType<typeof getPersonalBestsByUserId>>['data'],
  null
>[number];
interface PersonalBestProps {
  mode: Settings['mode'];
  amount: number;
  data?: PersonalBest;
}

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
  const { data: personalBests } = useQuery(getPersonalBestsByUserId(supabase, userId));

  return (
    <Group className='cursor-default gap-6'>
      <Group className='gap-4 rounded-xl bg-sub-alt p-4 transition-colors'>
        {settingsReference.time.options.map(({ value }) => {
          const personalBest = personalBests?.find(
            ({ mode, mode2, language }) =>
              mode === 'time' && +mode2 === value && language === 'english',
          );
          return <PersonalBest key={value} mode='time' amount={value} data={personalBest} />;
        })}
      </Group>
      <Group className='gap-4 rounded-xl bg-sub-alt p-4 transition-colors'>
        {settingsReference.words.options.map(({ value }) => {
          const personalBest = personalBests?.find(
            ({ mode, mode2, language }) =>
              mode === 'words' && +mode2 === value && language === 'english',
          );
          return <PersonalBest key={value} mode='words' amount={value} data={personalBest} />;
        })}
      </Group>
    </Group>
  );
}
