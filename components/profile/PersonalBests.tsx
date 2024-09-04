import { Text } from '@/components/core';
import { type Settings, type Time, type Words, settingsList } from '@/utils/settings';
import type { PersonalBest, User } from '@/utils/user';
import dayjs from 'dayjs';
import { twJoin } from 'tailwind-merge';

interface PersonalBestProps {
  mode: Settings['mode'];
  amount: number;
  data?: PersonalBest;
}

function PersonalBest({ mode, amount, data }: PersonalBestProps) {
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
          <div className='flex flex-col items-center gap-0.5'>
            <Text className='text-center text-xs'>{data.wpm.toFixed(2)} wpm</Text>
            <Text className='text-center text-xs'>{data.raw.toFixed(2)} raw</Text>
            <Text className='text-center text-xs'>{data.accuracy.toFixed(2)} acc</Text>
            <Text className='text-center text-xs'>{data.consistency.toFixed(2)} con</Text>
          </div>
          <Text className='text-center text-sm' dimmed>
            {dayjs.unix(data.date.seconds).format('DD MMM YYYY')}
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
        <Text className='text-4xl leading-tight'>{data?.wpm ? Math.floor(data.wpm) : '-'}</Text>
        <Text className='text-2xl leading-tight opacity-60'>
          {data?.accuracy ? `${Math.floor(data.accuracy)}%` : '-'}
        </Text>
      </div>
    </div>
  );
}

export default function PersonalBests({ data }: { data: User['personalBests'] }) {
  return (
    <div className='grid cursor-default grid-cols-2 gap-6'>
      <div className='grid grid-cols-[repeat(4,1fr)] gap-4 rounded-xl bg-sub-alt p-4 transition-colors'>
        {settingsList.time.options.map(({ value }) => (
          <PersonalBest key={value} mode='time' amount={value} data={data?.time?.[value as Time]} />
        ))}
      </div>
      <div className='grid grid-cols-[repeat(4,1fr)] gap-4 rounded-xl bg-sub-alt p-4 transition-colors'>
        {settingsList.words.options.map(({ value }) => (
          <PersonalBest
            key={value}
            mode='words'
            amount={value}
            data={data?.words?.[value as Words]}
          />
        ))}
      </div>
    </div>
  );
}
