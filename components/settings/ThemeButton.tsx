import { Button } from 'components/core';
import { ButtonProps } from 'components/core/Button';
import { forwardRef, ReactNode } from 'react';
import { RiCheckLine, RiLoaderLine } from 'react-icons/ri';
import { twMerge } from 'tailwind-merge';
import { ThemeInfo } from 'utils/theme';
import ThemeBubbles from './ThemeBubbles';

export interface ThemeButtonProps extends Omit<ButtonProps, 'ref' | 'name'>, ThemeInfo {
  leftNode?: ReactNode;
  loading?: boolean;
  selected: boolean;
}

const ThemeButton = forwardRef<HTMLButtonElement, ThemeButtonProps>(function ThemeButton(
  {
    bgColor,
    className,
    leftNode,
    loading,
    mainColor,
    name,
    subColor,
    selected,
    style,
    textColor,
    ...props
  },
  ref
) {
  return (
    <Button
      ref={ref}
      className={twMerge([
        'group grid w-full grid-cols-[1fr_auto_1fr] justify-items-end text-sm outline-0 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0.5 active:transform-none',
        selected && 'outline-2 outline-text',
        className,
      ])}
      variant='filled'
      style={{ background: bgColor, color: textColor, outlineColor: textColor, ...style }}
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
          {...{ bgColor, mainColor, subColor, textColor }}
        />
      )}
    </Button>
  );
});

export default ThemeButton;
