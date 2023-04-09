import { ReactNode } from 'react';
import { twJoin } from 'tailwind-merge';
import { Text } from '.';

export interface GroupProps {
  title: string;
  titleSize?: 'sm' | 'md' | 'lg';
  values: ReactNode | ReactNode[];
  valueDirection?: 'horizontal' | 'vertical';
  valueSize?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: '1rem',
  md: '2rem',
  lg: '4rem',
};

export default function Group({
  title,
  titleSize = 'sm',
  values,
  valueDirection = 'horizontal',
  valueSize = 'md',
}: GroupProps) {
  if (!Array.isArray(values)) values = [values];

  return (
    <div className='flex flex-col'>
      <Text className='mb-1 leading-none' dimmed style={{ fontSize: sizes[titleSize] }}>
        {title}
      </Text>
      <div
        className={twJoin([
          'flex leading-none text-main',
          valueDirection === 'vertical' && 'flex-col',
        ])}
        style={{ fontSize: sizes[valueSize] }}
      >
        {(values as ReactNode[]).map((value, index) =>
          ['string', 'number'].includes(typeof value) ? <div key={index}>{value}</div> : value
        )}
      </div>
    </div>
  );
}
