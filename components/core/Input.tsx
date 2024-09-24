'use client';

import { useFocusWithin, useId, useMergedRef } from '@mantine/hooks';
import {
  type ComponentPropsWithoutRef,
  type ElementRef,
  type ReactNode,
  type RefObject,
  forwardRef,
  useRef,
} from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';
import { twMerge } from 'tailwind-merge';
import { Tooltip } from './Tooltip';

export interface InputProps extends ComponentPropsWithoutRef<'input'> {
  error?: false | string;
  inputClassName?: string;
  label?: ReactNode;
  leftNode?: ReactNode;
  rightNode?: ReactNode;
  wrapperClassName?: string;
  wrapperRef?: RefObject<HTMLDivElement>;
}

export const Input = forwardRef<ElementRef<'input'>, InputProps>(function Input(
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
    wrapperRef,
    ...props
  },
  ref,
) {
  const uuid = useId(id);
  const inputRef = useRef<HTMLInputElement>(null);
  const { ref: wrapperFocusRef, focused } = useFocusWithin<HTMLDivElement>();
  const mergedInputRef = useMergedRef(ref, inputRef);
  const mergedWrapperRef = useMergedRef(wrapperRef, wrapperFocusRef);
  const isErrorVisible = !focused && error;

  return (
    <div
      ref={mergedWrapperRef}
      className={twMerge(
        'flex flex-col gap-1 text-sub transition focus-within:text-text',
        disabled && 'pointer-events-none opacity-50',
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
            '-outline-offset-2 flex w-full cursor-text items-center rounded-lg bg-sub-alt px-3 py-2 text-sub caret-main outline-main transition focus-within:text-text focus-within:outline-2 active:translate-y-0.5',
            error && 'outline-error',
            className,
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {leftNode}
          <input
            ref={mergedInputRef}
            className={twMerge(
              'h-full w-full border-0 bg-transparent outline-0 placeholder:text-sub',
              error && 'text-error',
              !!leftNode && 'pl-2',
              (!!rightNode || isErrorVisible) && 'pr-2',
              inputClassName,
            )}
            disabled={disabled}
            id={uuid}
            type={type}
            {...props}
          />
          {isErrorVisible && (
            <RiErrorWarningLine className='not-last:mr-1.5 min-w-max text-error' />
          )}
          {rightNode}
        </div>
      </Tooltip>
    </div>
  );
});
