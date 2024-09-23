import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'cva';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';
import type { IconBaseProps } from 'react-icons';
import { RiLoaderLine } from 'react-icons/ri';
import { twMerge } from 'tailwind-merge';

const button = cva({
  base: '-outline-offset-2 flex cursor-pointer select-none items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-center leading-tight outline-text transition',
  variants: {
    variant: {
      danger:
        'bg-sub-alt text-text outline-2 outline-error hover:bg-error hover:text-bg focus-visible:bg-error focus-visible:text-bg active:scale-[.925]',
      filled:
        'bg-sub-alt text-text hover:bg-text hover:text-bg focus-visible:outline-2 active:scale-[.925] data-[active]:bg-main data-[active]:text-bg data-[active]:hover:bg-text data-[active]:hover:text-bg',
      subtle:
        'bg-transparent text-sub hover:text-text focus-visible:bg-text focus-visible:text-bg active:scale-[.925] active:bg-text active:text-bg',
      text: 'bg-transparent text-sub hover:text-text focus-visible:text-text focus-visible:outline-0 active:translate-y-0.5 data-[active]:text-main data-[active]:hover:text-text',
    },
  },
});

export interface ButtonProps
  extends ComponentPropsWithoutRef<'button'>,
    VariantProps<typeof button> {
  asChild?: boolean;
  active?: boolean;
  loaderProps?: IconBaseProps;
  loading?: boolean;
}

export const Button = forwardRef<ElementRef<'button'>, ButtonProps>(function Button(
  {
    asChild,
    active = false,
    children,
    className,
    disabled,
    loaderProps: { className: loaderClassName, ...loaderProps } = {},
    loading,
    type = 'button',
    variant = 'filled',
    ...props
  },
  ref,
) {
  const Component = asChild ? Slot : 'button';
  return (
    <Component
      ref={ref}
      data-active={active || undefined}
      className={twMerge(
        button({ variant }),
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {loading ? (
        <RiLoaderLine className={twMerge('m-0.5 animate-spin', loaderClassName)} {...loaderProps} />
      ) : (
        children
      )}
    </Component>
  );
});
