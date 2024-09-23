import type { ThemeColors } from '@/utils/theme';
import { type ComponentPropsWithoutRef, memo } from 'react';
import { twMerge } from 'tailwind-merge';

export interface ThemeBubblesProps extends ComponentPropsWithoutRef<'div'> {
  colors: Partial<ThemeColors>;
  withBackground?: boolean;
}

export const ThemeBubbles = memo(function ThemeBubbles({
  className,
  colors,
  style,
  withBackground,
  ...props
}: ThemeBubblesProps) {
  const { bg, main, sub, text } = colors;
  return (
    <div
      className={twMerge(
        'flex gap-1.5 rounded-full [&>*]:h-3 [&>*]:w-3 [&>*]:rounded-full',
        withBackground && 'rounded-full p-1',
        className,
      )}
      style={{ background: withBackground ? bg : undefined, ...style }}
      {...props}
    >
      <div style={{ background: main }} />
      <div style={{ background: sub }} />
      <div style={{ background: text }} />
    </div>
  );
});
