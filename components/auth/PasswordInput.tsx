'use client';

import { useDidUpdate, useMergedRef, useUncontrolled } from '@mantine/hooks';
import { Button, Tooltip } from 'components/core';
import Input, { InputProps } from 'components/core/Input';
import { ElementRef, forwardRef, useRef } from 'react';
import { RiEyeLine, RiEyeOffLine, RiLockPasswordFill } from 'react-icons/ri';

export interface PasswordInputProps extends InputProps {
  onVisibilityChange?: (value: boolean) => void;
  visible?: boolean;
}

const PasswordInput = forwardRef<ElementRef<'input'>, PasswordInputProps>(function PasswordInput(
  { leftNode, onVisibilityChange, rightNode, visible, ...props },
  ref,
) {
  const [_visible, handleVisible] = useUncontrolled({
    value: visible,
    defaultValue: false,
    onChange: onVisibilityChange,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergedRef(ref, inputRef);

  useDidUpdate(() => {
    setTimeout(() => {
      if (inputRef.current) {
        const { value } = inputRef.current;
        inputRef.current.value = '';
        inputRef.current.value = value;
      }
    }, 0);
  }, [_visible]);

  return (
    <Input
      ref={mergedRef}
      placeholder='password'
      type={_visible ? 'text' : 'password'}
      leftNode={
        <>
          <RiLockPasswordFill />
          {leftNode}
        </>
      }
      rightNode={
        <>
          {rightNode}
          <Tooltip label={`${_visible ? 'Hide' : 'Show'} password`}>
            <Button className='p-0' tabIndex={-1} onClick={() => handleVisible(!_visible)}>
              {_visible ? <RiEyeLine /> : <RiEyeOffLine />}
            </Button>
          </Tooltip>
        </>
      }
      {...props}
    />
  );
});

export default PasswordInput;
