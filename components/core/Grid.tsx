import { Slot } from '@radix-ui/react-slot';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface GridProps extends ComponentPropsWithoutRef<'div'> {
  asChild?: boolean;
}

export const Grid = forwardRef<ElementRef<'div'>, GridProps>(function Grid(
  { asChild, className, ...props },
  ref,
) {
  const Component = asChild ? Slot : 'div';
  return (
    <Component ref={ref} className={twMerge('grid grid-cols-2 gap-2', className)} {...props} />
  );
});
