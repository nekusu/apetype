import { Slot } from '@radix-ui/react-slot';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface TextProps extends ComponentPropsWithoutRef<'div'> {
  asChild?: boolean;
  dimmed?: boolean;
}

export const Text = forwardRef<ElementRef<'div'>, TextProps>(function Text(
  { asChild, className, dimmed = false, ...props },
  ref,
) {
  const Component = asChild ? Slot : 'div';
  return (
    <Component
      ref={ref}
      className={twMerge('text-left transition', dimmed ? 'text-sub' : 'text-text', className)}
      {...props}
    />
  );
});
