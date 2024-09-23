import { Button } from '@/components/core/Button';
import type { ButtonProps } from '@/components/core/Button';
import type { ThemeColors } from '@/utils/theme';
import { type ReactNode, forwardRef } from 'react';
import { RiCheckLine, RiLoaderLine } from 'react-icons/ri';
import { twMerge } from 'tailwind-merge';
import { ThemeBubbles } from './ThemeBubbles';

export interface ThemeButtonProps extends Omit<ButtonProps, 'ref' | 'name'> {
  colors: Partial<ThemeColors>;
  leftNode?: ReactNode;
  loading?: boolean;
  name: string;
  selected: boolean;
}

export const ThemeButton = forwardRef<HTMLButtonElement, ThemeButtonProps>(function ThemeButton(
  { className, colors, leftNode, loading, name, selected, style, ...props },
  ref,
) {
  const { bg, text } = colors;
  return (
    <Button
      ref={ref}
      className={twMerge(
        'group hover:-translate-y-0.5 grid w-full grid-cols-[1fr_auto_1fr] justify-items-end text-sm hover:shadow-lg active:translate-y-0.5 active:transform-none',
        selected && 'outline-2',
        className,
      )}
      style={{ background: bg, color: text, outlineColor: text, ...style }}
      {...props}
    >
      <div className='justify-self-start opacity-0 transition-opacity group-hover:opacity-100'>
        {leftNode}
      </div>
      {name}
      {selected ? (
        loading ? (
          <RiLoaderLine className='animate-spin' size={18} />
        ) : (
          <RiCheckLine size={18} />
        )
      ) : (
        <ThemeBubbles
          className='opacity-0 transition-opacity group-hover:opacity-100'
          colors={colors}
        />
      )}
    </Button>
  );
});
