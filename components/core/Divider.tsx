import { type ComponentPropsWithoutRef, type ElementRef, type ReactNode, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import Text from './Text';

export interface DividerProps extends ComponentPropsWithoutRef<'div'> {
  label?: ReactNode;
  orientation?: 'horizontal' | 'vertical';
}

const Divider = forwardRef<ElementRef<'div'>, DividerProps>(function Divider(
  { className, label, orientation = 'vertical', ...props },
  ref,
) {
  return label ? (
    <div ref={ref} className='grid grid-cols-[1fr_auto_1fr] gap-2' {...props}>
      <div className={twMerge('h-0.5 self-center rounded bg-sub transition', className)} />
      {typeof label === 'string' ? (
        <Text asChild className='text-xs' dimmed>
          <span>{label}</span>
        </Text>
      ) : (
        label
      )}
      <div className={twMerge('h-0.5 self-center rounded bg-sub transition', className)} />
    </div>
  ) : (
    <div
      className={twMerge(
        'self-stretch rounded bg-bg transition',
        orientation === 'vertical' ? 'my-2 w-1' : 'mx-2 h-1',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

export default Divider;
