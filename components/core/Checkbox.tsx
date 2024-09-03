'use client';

import { useId, useUncontrolled } from '@mantine/hooks';
import { ComponentPropsWithoutRef, ElementRef, ReactNode, forwardRef } from 'react';
import { RiCheckLine } from 'react-icons/ri';
import { twJoin, twMerge } from 'tailwind-merge';
import Button, { ButtonProps } from './Button';

export interface CheckboxProps extends ComponentPropsWithoutRef<'input'> {
  label?: ReactNode;
  labelClassName?: string;
  labelPosition?: 'left' | 'right';
  setChecked?: (value: boolean) => void;
  variant?: ButtonProps['variant'];
  wrapperClassName?: string;
}

const Checkbox = forwardRef<ElementRef<'input'>, CheckboxProps>(function Checkbox(
  {
    checked,
    className,
    defaultChecked,
    disabled,
    id,
    label,
    labelClassName,
    labelPosition = 'right',
    onChange,
    setChecked,
    variant = 'filled',
    wrapperClassName,
    ...props
  },
  ref,
) {
  const uuid = useId(id);
  const [_checked, handleChecked] = useUncontrolled({
    value: checked,
    defaultValue: defaultChecked,
    onChange: setChecked,
  });

  const Label = ({ className, ...props }: ComponentPropsWithoutRef<'label'>) => (
    <label
      className={twMerge('text-sub transition active:translate-y-0.5', className, labelClassName)}
      htmlFor={uuid}
      {...props}
    >
      {label}
    </label>
  );

  return (
    <div
      className={twMerge(
        'group relative flex transition items-center select-none',
        disabled && 'pointer-events-none opacity-60',
        wrapperClassName,
      )}
    >
      {label && labelPosition === 'left' && <Label className='pr-2' />}
      <Button
        active={_checked}
        className={twMerge('p-1 text-bg text-sm group-hover:bg-text', className)}
        variant={variant}
        onClick={() => handleChecked(!_checked)}
      >
        <RiCheckLine className={twJoin('transition', _checked ? 'opacity-100' : 'opacity-0')} />
      </Button>
      <input
        ref={ref}
        className='absolute opacity-0 -z-10'
        disabled={disabled}
        id={uuid}
        type='checkbox'
        checked={_checked}
        tabIndex={-1}
        onChange={(e) => {
          onChange?.(e);
          handleChecked(e.target.checked);
        }}
        {...props}
      />
      {label && labelPosition === 'right' && <Label className='pl-2' />}
    </div>
  );
});

export default Checkbox;
