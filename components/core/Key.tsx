import { DetailedHTMLProps, forwardRef, HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export type KeyProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const Key = forwardRef<HTMLDivElement, KeyProps>(function Key({ className, ...props }, ref) {
  return (
    <span
      className={twMerge([
        'mx-px inline-block rounded bg-sub px-1 text-xs text-bg transition',
        className,
      ])}
      ref={ref}
      {...props}
    />
  );
});

export default Key;
