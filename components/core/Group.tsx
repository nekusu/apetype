import { Text } from '.';

export interface GroupProps {
  title: string;
  titleSize?: 'sm' | 'md' | 'lg';
  values: (string | number | undefined) | (string | number | undefined)[];
  valueSize?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: '1rem',
  md: '2rem',
  lg: '4rem',
};

export default function Group({ title, titleSize = 'sm', values, valueSize = 'md' }: GroupProps) {
  if (typeof values !== 'object') {
    values = [values];
  }

  return (
    <div className='flex flex-col'>
      <Text className='mb-1 leading-none' dimmed style={{ fontSize: sizes[titleSize] }}>
        {title}
      </Text>
      {values.map((value, index) => (
        <Text
          key={index}
          className='leading-none text-main'
          dimmed
          style={{ fontSize: sizes[valueSize] }}
        >
          {value}
        </Text>
      ))}
    </div>
  );
}
