import { Text } from 'components/core';
import { memo, ReactNode } from 'react';

interface SettingProps<T> {
  children?: ReactNode;
  title: string;
  description: ReactNode;
  options: { alt?: string; value: T }[];
  gridColumns?: number;
}

function Setting<T>({ children, title, description, options, gridColumns }: SettingProps<T>) {
  return (
    <div
      className='grid auto-rows-auto gap-x-5 gap-y-1.5'
      style={{ gridTemplateColumns: gridColumns ? '1fr' : '2fr 1fr' }}
    >
      <Text className='col-span-full text-lg' component='h3'>
        {title}
      </Text>
      {description && (
        <Text className='text-sm' dimmed>
          {description}
        </Text>
      )}
      <div
        className='grid items-center gap-2'
        style={{ gridTemplateColumns: `repeat(${gridColumns || options.length}, 1fr)` }}
      >
        {children}
      </div>
    </div>
  );
}

export default memo(Setting);
