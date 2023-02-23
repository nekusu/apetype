import { ButtonHTMLAttributes, DetailedHTMLProps, memo } from 'react';
import { twMerge } from 'tailwind-merge';
import { ThemeInfo } from 'utils/settings';

export interface ThemeBubblesProps
  extends Partial<ThemeInfo>,
    DetailedHTMLProps<ButtonHTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  withBackground?: boolean;
}

function ThemeBubbles({
  className,
  style,
  bgColor,
  mainColor,
  subColor,
  textColor,
  withBackground,
  ...props
}: ThemeBubblesProps) {
  return (
    <div
      className={twMerge([
        'flex gap-1.5 rounded-full',
        withBackground && 'rounded-full p-1',
        className,
      ])}
      style={{ background: withBackground ? bgColor : undefined, ...style }}
      {...props}
    >
      <div className='h-3 w-3 rounded-full' style={{ background: mainColor }} />
      <div className='h-3 w-3 rounded-full' style={{ background: subColor }} />
      <div className='h-3 w-3 rounded-full' style={{ background: textColor }} />
    </div>
  );
}

export default memo(ThemeBubbles);
