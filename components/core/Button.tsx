import { Slot } from '@radix-ui/react-slot';
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  asChild?: boolean;
  active?: boolean;
  variant?: 'danger' | 'filled' | 'subtle' | 'text';
}

function getVariantStyles(variant: NonNullable<ButtonProps['variant']>) {
  const className = ['danger', 'filled'].includes(variant)
    ? 'bg-sub-alt text-text -outline-offset-2 active:scale-[.925]'
    : 'text-sub hover:text-text bg-transparent';
  switch (variant) {
    case 'danger':
      return twMerge(
        className,
        'outline-2 outline-error hover:bg-error hover:text-bg focus-visible:bg-error focus-visible:text-bg',
      );
    case 'filled':
      return twMerge(className, 'hover:bg-text hover:text-bg focus-visible:outline-2');
    case 'subtle':
      return twMerge(
        className,
        'focus-visible:bg-text focus-visible:text-bg active:bg-text active:text-bg active:scale-[.925]',
      );
    case 'text':
      return twMerge(
        className,
        'focus-visible:text-text focus-visible:outline-0 active:translate-y-0.5',
      );
  }
}

const Button = forwardRef<ElementRef<'button'>, ButtonProps>(function Button(
  { asChild, active = false, className, disabled, type = 'button', variant = 'text', ...props },
  ref,
) {
  const Component = asChild ? Slot : 'button';
  return (
    <Component
      ref={ref}
      className={twMerge(
        'flex w-max cursor-pointer select-none items-center justify-center gap-1.5 rounded-lg p-2 text-center text-base leading-tight transition outline-text',
        getVariantStyles(variant),
        variant === 'filled' && active && 'bg-main text-bg',
        variant === 'text' && active && 'text-main',
        disabled && 'pointer-events-none opacity-60',
        className,
      )}
      disabled={disabled}
      type={type}
      {...props}
    />
  );
});

export default Button;
