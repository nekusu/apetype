'use client';

import { useId, useUncontrolled } from '@mantine/hooks';
import { type ComponentPropsWithoutRef, type ElementRef, type ReactNode, forwardRef } from 'react';
import { RiCheckLine } from 'react-icons/ri';
import { twJoin, twMerge } from 'tailwind-merge';
import { Button, type ButtonProps } from './Button';

export interface CheckboxProps extends ComponentPropsWithoutRef<'input'> {
  label?: ReactNode;
  labelClassName?: string;
  labelPosition?: 'left' | 'right';
  setChecked?: (value: boolean) => void;
  variant?: ButtonProps['variant'];
  wrapperClassName?: string;
}

export const Checkbox = forwardRef<ElementRef<'input'>, CheckboxProps>(function Checkbox(
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
        'group relative flex select-none items-center transition',
        disabled && 'pointer-events-none opacity-50',
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
        className='-z-10 absolute opacity-0'
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
