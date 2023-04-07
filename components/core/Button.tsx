import { ButtonHTMLAttributes, DetailedHTMLProps, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { PolymorphicComponentProps, createPolymorphicComponent } from 'utils/polymorphicComponent';
import Dynamic from './Dynamic';

export interface ButtonProps
  extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  active?: boolean;
  variant?: 'danger' | 'filled' | 'subtle' | 'text';
}

function getVariantStyles(variant: NonNullable<ButtonProps['variant']>) {
  const className = ['danger', 'filled'].includes(variant)
    ? 'bg-sub-alt text-text outline-offset-[-2px] active:scale-[.925]'
    : 'text-sub hover:text-text';
  switch (variant) {
    case 'danger':
      return twMerge([
        className,
        'outline-2 outline-error hover:bg-error hover:text-bg focus:bg-error focus:text-bg',
      ]);
    case 'filled':
      return twMerge([className, 'hover:bg-text hover:text-bg focus:outline-2 focus:outline-text']);
    case 'subtle':
      return twMerge([className, 'focus:bg-text focus:text-bg active:scale-[.925]']);
    case 'text':
      return twMerge([className, 'focus:text-text active:-translate-y-0.5']);
  }
}

const Button = forwardRef<HTMLButtonElement, PolymorphicComponentProps<'button', ButtonProps>>(
  function Button({ active = false, className, type = 'button', variant = 'text', ...props }, ref) {
    return (
      <Dynamic
        component='button'
        className={twMerge([
          'flex w-max cursor-pointer select-none items-center justify-center gap-1.5 rounded-lg p-2 text-center text-base leading-tight outline-none transition',
          getVariantStyles(variant),
          variant === 'filled' && active && 'bg-main text-bg',
          variant === 'text' && active && 'text-main',
          className,
        ])}
        type={type}
        ref={ref}
        {...props}
      />
    );
  }
);

export default createPolymorphicComponent<'button', ButtonProps>(Button);
