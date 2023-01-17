import { Button, Flex, Text } from 'components/core';
import { memo, ReactNode } from 'react';
import { DraftFunction } from 'use-immer';
import { Settings } from 'utils/settings';

interface SettingProps<T> {
  id: keyof Settings;
  value: T;
  title: string;
  description: ReactNode;
  options: { alt?: string; value: T }[];
  setSettings: (draft: DraftFunction<Settings>) => void;
}

function Setting<T>({ id, value, title, description, options, setSettings }: SettingProps<T>) {
  return (
    <div className='grid auto-rows-auto grid-cols-[2fr_1fr] gap-x-5 gap-y-1.5'>
      <Text className='col-span-full text-lg' component='h3'>
        {title}
      </Text>
      <Text className='text-sm' dimmed>
        {description}
      </Text>
      <Flex className='flex-nowrap'>
        {options.map((option) => (
          <Button
            key={option.value as string}
            active={value === option.value}
            className='flex-1'
            onClick={() => setSettings((draft) => void (draft[id] = option.value as never))}
            variant='filled'
          >
            {option.alt ?? (option.value as string)}
          </Button>
        ))}
      </Flex>
    </div>
  );
}

export default memo(Setting);
