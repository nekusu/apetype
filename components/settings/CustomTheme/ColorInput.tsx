'use client';

import { Button } from '@/components/core/Button';
import { ColorPicker } from '@/components/core/ColorPicker';
import { Input, type InputProps } from '@/components/core/Input';
import { Key } from '@/components/core/Key';
import { Text } from '@/components/core/Text';
import { Tooltip } from '@/components/core/Tooltip';
import { type ThemeColors, themeColorLabels } from '@/utils/theme';
import { useEyeDropper, useFocusWithin, useMergedRef } from '@mantine/hooks';
import { type ElementRef, forwardRef, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { RiForbidFill, RiSipLine } from 'react-icons/ri';

export interface ColorInputProps extends InputProps {
  colorKey: keyof ThemeColors;
  value?: string;
  computedValue?: string;
  setValue?: (value: string) => void;
}

export const ColorInput = forwardRef<ElementRef<'input'>, ColorInputProps>(function ColorInput(
  { colorKey, computedValue, rightNode, setValue, value, ...props },
  ref,
) {
  const { supported, open } = useEyeDropper();
  const { ref: focusRef, focused } = useFocusWithin();
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergedRef(ref, inputRef);

  const pickColor = async () => {
    const toastId = toast(
      (t) => (
        <div className='-mb-0.5 flex items-center gap-2.5'>
          <span className='shrink-0 text-lg text-main'>{t.icon}</span>
          <Text className='leading-tight'>
            Press <Key className='text-sm'>esc</Key> to cancel selection.
          </Text>
        </div>
      ),
      { duration: Number.POSITIVE_INFINITY, icon: <RiForbidFill /> },
    );
    try {
      const eyeDropper = await open();
      if (eyeDropper) setValue?.(eyeDropper.sRGBHex);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      inputRef.current?.focus();
      toast.dismiss(toastId);
    }
  };

  return (
    <Input
      ref={mergedRef}
      wrapperRef={focusRef}
      label={themeColorLabels[colorKey]}
      leftNode={
        <ColorPicker color={computedValue ?? value ?? ''} onChange={(color) => setValue?.(color)} />
      }
      rightNode={
        <>
          {supported && focused && (
            <Tooltip label='Pick color'>
              <Button
                className='p-0'
                tabIndex={-1}
                onKeyDown={() => inputRef.current?.focus()}
                onClick={pickColor}
                variant='text'
              >
                <RiSipLine />
              </Button>
            </Tooltip>
          )}
          {rightNode}
        </>
      }
      value={value}
      {...props}
    />
  );
});
