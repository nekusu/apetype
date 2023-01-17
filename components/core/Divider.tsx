import clsx from 'clsx';
import { DetailedHTMLProps, forwardRef, HTMLAttributes } from 'react';

export interface DividerProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical';
}

const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { className, orientation = 'vertical', ...props },
  ref
) {
  return (
    <div
      className={clsx([
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
