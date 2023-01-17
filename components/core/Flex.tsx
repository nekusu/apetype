import clsx from 'clsx';
import { DetailedHTMLProps, forwardRef, HTMLAttributes } from 'react';

export type FlexProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const Flex = forwardRef<HTMLDivElement, FlexProps>(function Flex({ className, ...props }, ref) {
  return (
    <div
      className={clsx([`flex flex-row flex-wrap items-center justify-start gap-2`, className])}
      ref={ref}
      {...props}
    />
  );
});

export default Flex;
