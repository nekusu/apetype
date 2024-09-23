import { Slot } from '@radix-ui/react-slot';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface KeyProps extends ComponentPropsWithoutRef<'div'> {
  asChild?: boolean;
}

export const Key = forwardRef<ElementRef<'div'>, KeyProps>(function Key(
  { asChild, className, ...props },
  ref,
) {
  const Component = asChild ? Slot : 'span';
  return (
    <Component
      className={twMerge(
        'mx-px inline-block rounded bg-sub px-1 text-bg text-xs transition',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
