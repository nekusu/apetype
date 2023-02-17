import { DetailedHTMLProps, forwardRef, HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { createPolymorphicComponent, PolymorphicComponentProps } from 'utils/polymorphicComponent';
import Dynamic from './Dynamic';

export interface TextProps
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  dimmed?: boolean;
}

const Text = forwardRef<HTMLDivElement, PolymorphicComponentProps<'div', TextProps>>(function Text(
  { className, dimmed = false, ...props },
  ref
) {
  return (
    <Dynamic
      className={twMerge([
        `text-left text-base transition`,
        dimmed ? 'text-sub' : `text-text`,
        className,
      ])}
      ref={ref}
      {...props}
    />
  );
});

export default createPolymorphicComponent<'div', TextProps>(Text);
