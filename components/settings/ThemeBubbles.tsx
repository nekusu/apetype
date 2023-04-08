import { ComponentPropsWithoutRef, memo } from 'react';
import { twMerge } from 'tailwind-merge';
import { ThemeColors } from 'utils/theme';

export interface ThemeBubblesProps extends ComponentPropsWithoutRef<'div'> {
  colors: Partial<ThemeColors>;
  withBackground?: boolean;
}

function ThemeBubbles({ className, colors, style, withBackground, ...props }: ThemeBubblesProps) {
  const { bg, main, sub, text } = colors;
  return (
    <div
      className={twMerge([
        'flex gap-1.5 rounded-full',
        withBackground && 'rounded-full p-1',
        className,
      ])}
      style={{ background: withBackground ? bg : undefined, ...style }}
      {...props}
    >
      <div className='h-3 w-3 rounded-full' style={{ background: main }} />
      <div className='h-3 w-3 rounded-full' style={{ background: sub }} />
      <div className='h-3 w-3 rounded-full' style={{ background: text }} />
    </div>
  );
}

export default memo(ThemeBubbles);
