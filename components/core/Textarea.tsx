'use client';

import { useFocusWithin, useId, useMergedRef } from '@mantine/hooks';
import { type ComponentPropsWithoutRef, type ElementRef, type ReactNode, forwardRef } from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';
import { twMerge } from 'tailwind-merge';
import { Tooltip } from './Tooltip';

export interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  error?: false | string;
  textareaClassName?: string;
  label?: ReactNode;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<ElementRef<'textarea'>, TextareaProps>(function Textarea(
  { className, disabled, error, id, textareaClassName, label, wrapperClassName, ...props },
  ref,
) {
  const uuid = useId(id);
  const { ref: textareaRef, focused } = useFocusWithin<HTMLTextAreaElement>();
  const mergedRef = useMergedRef(ref, textareaRef);
  const isErrorVisible = !focused && error;

  return (
    <div
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
            '-outline-offset-2 relative flex w-full cursor-text items-center rounded-lg bg-sub-alt px-3 py-2 text-sub caret-main outline-main transition focus-within:text-text focus-within:outline-2 active:translate-y-0.5',
            error && 'outline-error',
            className,
          )}
          onClick={() => textareaRef.current?.focus()}
        >
          <textarea
            ref={mergedRef}
            className={twMerge(
              'h-full min-h-6 w-full border-0 bg-transparent outline-0 placeholder:text-sub',
              error && 'text-error',
              textareaClassName,
            )}
            disabled={disabled}
            id={uuid}
            {...props}
          />
          {isErrorVisible && (
            <RiErrorWarningLine className='not-last:mr-1.5 min-w-max text-error' />
          )}
        </div>
      </Tooltip>
    </div>
  );
});
