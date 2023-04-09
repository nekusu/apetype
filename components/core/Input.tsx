'use client';

import { useId, useMergedRef } from '@mantine/hooks';
import {
  ComponentPropsWithoutRef,
  ElementRef,
  ReactNode,
  forwardRef,
  useRef,
  useState,
} from 'react';
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
    onFocus,
    onBlur,
    rightNode,
    type = 'text',
    wrapperClassName,
    ...props
  },
  ref
) {
  const uuid = useId(id);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergedRef(ref, inputRef);
  const isErrorVisible = !isFocused && error;

  return (
    <div
      className={twMerge([
        'flex flex-col gap-1 text-sub transition focus-within:text-text',
        disabled && 'pointer-events-none opacity-60',
        wrapperClassName,
      ])}
    >
      {label && (
        <label
          className={twMerge(['w-max', typeof label === 'string' && 'text-sm leading-none'])}
          htmlFor={uuid}
        >
          {label}
        </label>
      )}
      <Tooltip className='bg-error text-bg' label={error} disabled={!isErrorVisible}>
        <div
          className={twMerge([
            'flex w-full cursor-text items-center rounded-lg bg-sub-alt px-3 py-2 text-sub caret-main outline-none -outline-offset-2 transition focus-within:text-text focus-within:outline-2 focus-within:outline-main active:translate-y-0.5',
            className,
          ])}
          onClick={() => inputRef.current?.focus()}
        >
          {leftNode}
          <input
            ref={mergedRef}
            className={twMerge([
              'h-full w-full bg-transparent outline-none placeholder:text-sub',
              error && 'text-error',
              leftNode && 'pl-2',
              (rightNode || isErrorVisible) && 'pr-2',
              inputClassName,
            ])}
            disabled={disabled}
            id={uuid}
            type={type}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />
          {rightNode}
          {isErrorVisible && <RiErrorWarningLine className='ml-2 min-w-max text-error' />}
        </div>
      </Tooltip>
    </div>
  );
});

export default Input;
