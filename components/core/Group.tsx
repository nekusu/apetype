import { ReactNode } from 'react';
import { Text } from '.';

export interface GroupProps {
  title: string;
  titleSize?: 'sm' | 'md' | 'lg';
  values: ReactNode | ReactNode[];
  valueSize?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: '1rem',
  md: '2rem',
  lg: '4rem',
};

export default function Group({ title, titleSize = 'sm', values, valueSize = 'md' }: GroupProps) {
  if (!Array.isArray(values)) values = [values];

  return (
    <div className='flex flex-col'>
      <Text className='mb-1 leading-none' dimmed style={{ fontSize: sizes[titleSize] }}>
        {title}
      </Text>
      {(values as ReactNode[]).map((value, index) =>
        ['string', 'number'].includes(typeof value) ? (
          <Text
            key={index}
            className='leading-none text-main'
            dimmed
            style={{ fontSize: sizes[valueSize] }}
          >
            {value}
          </Text>
        ) : (
          value
        )
      )}
    </div>
  );
}
