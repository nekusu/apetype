import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface DividerProps extends ComponentPropsWithoutRef<'div'> {
  orientation?: 'horizontal' | 'vertical';
}

const Divider = forwardRef<ElementRef<'div'>, DividerProps>(function Divider(
  { className, orientation = 'vertical', ...props },
  ref
) {
  return (
    <div
      className={twMerge([
        'self-stretch rounded bg-bg transition',
        orientation === 'vertical' ? 'my-2 w-1' : 'mx-2 h-1',
        className,
      ])}
      ref={ref}
      {...props}
    />
  );
});

export default Divider;
