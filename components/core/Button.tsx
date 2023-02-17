import { ButtonHTMLAttributes, DetailedHTMLProps, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { createPolymorphicComponent, PolymorphicComponentProps } from 'utils/polymorphicComponent';
import Dynamic from './Dynamic';

export interface ButtonProps
  extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  active?: boolean;
  variant?: 'filled' | 'subtle' | 'text';
}

const Button = forwardRef<HTMLButtonElement, PolymorphicComponentProps<'button', ButtonProps>>(
  function Button({ active = false, className, variant = 'text', ...props }, ref) {
    return (
      <Dynamic
        component='button'
        className={twMerge([
          'flex w-max cursor-pointer select-none items-center justify-center gap-1.5 rounded-lg p-2 text-center text-base leading-tight outline-none transition',
          variant === 'filled'
            ? 'bg-sub-alt text-text outline-offset-[-2px] hover:bg-text hover:text-bg focus:outline-2 focus:outline-text active:scale-[.925]'
            : 'text-sub hover:text-text focus:text-text',
          variant === 'filled' && active && 'bg-main text-bg',
          variant === 'subtle' && 'focus:bg-text focus:text-bg active:scale-[.925]',
          variant === 'text' && 'active:translate-y-[2px]',
          variant === 'text' && active && 'text-main',
          className,
        ])}
        ref={ref}
        {...props}
      />
    );
  }
);

export default createPolymorphicComponent<'button', ButtonProps>(Button);
