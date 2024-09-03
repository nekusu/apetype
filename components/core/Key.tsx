import { Slot } from '@radix-ui/react-slot';
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface KeyProps extends ComponentPropsWithoutRef<'div'> {
  asChild?: boolean;
}

const Key = forwardRef<ElementRef<'div'>, KeyProps>(function Key(
  { asChild, className, ...props },
  ref,
) {
  const Component = asChild ? Slot : 'span';
  return (
    <Component
      className={twMerge(
        'mx-px inline-block rounded bg-sub px-1 text-xs text-bg transition',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

export default Key;
