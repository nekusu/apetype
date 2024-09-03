'use client';

import { useFocusWithin, useId, useMergedRef } from '@mantine/hooks';
import { ComponentPropsWithoutRef, ElementRef, ReactNode, forwardRef } from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';
import { twMerge } from 'tailwind-merge';
import Tooltip from './Tooltip';

export interface InputProps extends ComponentPropsWithoutRef<'input'> {
  error?: false | string;
  inputClassName?: string;
  label?: ReactNode;
  leftNode?: ReactNode;
  rightNode?: ReactNode;
  wrapperClassName?: string;
}

const Input = forwardRef<ElementRef<'input'>, InputProps>(function Input(
  {
    className,
    disabled,
    error,
    id,
    inputClassName,
    label,
    leftNode,
    rightNode,
    type = 'text',
    wrapperClassName,
    ...props
  },
  ref,
) {
  const uuid = useId(id);
  const { ref: inputRef, focused } = useFocusWithin<HTMLInputElement>();
  const mergedRef = useMergedRef(ref, inputRef);
  const isErrorVisible = !focused && error;

  return (
    <div
      className={twMerge(
        'flex flex-col gap-1 text-sub transition focus-within:text-text',
        disabled && 'pointer-events-none opacity-60',
        wrapperClassName,
      )}
    >
      {label && (
        <label
          className={twMerge('w-max', typeof label === 'string' && 'text-sm leading-none')}
          htmlFor={uuid}
        >
          {label}
        </label>
      )}
      <Tooltip className='bg-error text-bg' label={error} disabled={!error}>
        <div
          className={twMerge(
            'flex w-full cursor-text items-center rounded-lg bg-sub-alt px-3 py-2 text-sub caret-main focus-within:outline-2 transition focus-within:text-text outline-main -outline-offset-2 active:translate-y-0.5',
            error && 'outline-error',
            className,
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {leftNode}
          <input
            ref={mergedRef}
            className={twMerge(
              'h-full w-full bg-transparent outline-0 border-0 placeholder:text-sub',
              error && 'text-error',
              leftNode && 'pl-2',
              (rightNode || isErrorVisible) && 'pr-2',
              inputClassName,
            )}
            disabled={disabled}
            id={uuid}
            type={type}
            {...props}
          />
          {isErrorVisible && (
            <RiErrorWarningLine className='min-w-max text-error not-last:mr-1.5' />
          )}
          {rightNode}
        </div>
      </Tooltip>
    </div>
  );
});

export default Input;
