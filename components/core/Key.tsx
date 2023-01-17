import { DetailedHTMLProps, forwardRef, HTMLAttributes } from 'react';

export type KeyProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const Key = forwardRef<HTMLDivElement, KeyProps>(function Key({ ...props }, ref) {
  return (
    <span
      className='mx-px inline-block rounded bg-sub px-1 text-xs text-bg transition'
      ref={ref}
      {...props}
    />
  );
});

export default Key;
