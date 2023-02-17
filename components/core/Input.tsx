import { DetailedHTMLProps, forwardRef, InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export interface InputProps
  extends DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  icon?: React.ReactNode;
  iconClassName?: string;
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, icon, iconClassName, wrapperClassName, ...props },
  ref
) {
  return (
    <div
      className={twMerge([
        'relative text-base transition active:translate-y-[2px]',
        wrapperClassName,
      ])}
    >
      {icon && (
        <div
          className={twMerge([
            'pointer-events-none absolute inset-y-0 left-0 flex w-9 items-center justify-center text-sub',
            iconClassName,
          ])}
        >
          {icon}
        </div>
      )}
      <input
        className={twMerge([
          'w-full rounded-lg bg-sub-alt py-2 px-2.5 leading-tight text-sub caret-main outline-none outline-offset-[-2px] transition focus:text-text focus:outline-2 focus:outline-main',
          icon && 'pl-9',
          className,
        ])}
        ref={ref}
        {...props}
      />
    </div>
  );
});

export default Input;
