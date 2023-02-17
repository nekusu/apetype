import { DetailedHTMLProps, forwardRef, HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export type FlexProps = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const Flex = forwardRef<HTMLDivElement, FlexProps>(function Flex({ className, ...props }, ref) {
  return (
    <div
      className={twMerge([`flex flex-row flex-wrap items-center justify-start gap-2`, className])}
      ref={ref}
      {...props}
    />
  );
});

export default Flex;
