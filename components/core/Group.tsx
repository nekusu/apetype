import { Slot } from '@radix-ui/react-slot';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface GroupProps extends ComponentPropsWithoutRef<'div'> {
  asChild?: boolean;
  grow?: boolean;
}

export const Group = forwardRef<ElementRef<'div'>, GroupProps>(function Group(
  { asChild, className, grow = true, ...props },
  ref,
) {
  const Component = asChild ? Slot : 'div';
  return (
    <Component
      ref={ref}
      className={twMerge('flex gap-2', grow && '[&>*]:flex-1', className)}
      {...props}
    />
  );
});
