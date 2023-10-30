import { useEyeDropper, useFocusWithin, useMergedRef } from '@mantine/hooks';
import { Button, ColorPicker, Input, Key, Text, Tooltip } from 'components/core';
import { InputProps } from 'components/core/Input';
import { ElementRef, forwardRef, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { RiForbidFill, RiSipLine } from 'react-icons/ri';
import { ThemeColors } from 'utils/theme';

const LABELS: ThemeColors = {
  bg: 'background',
  main: 'main',
  caret: 'caret',
  sub: 'sub',
  subAlt: 'sub alt',
  text: 'text',
  error: 'error',
  errorExtra: 'error extra',
  colorfulError: 'colorful error',
  colorfulErrorExtra: 'colorful error extra',
};

type Color = keyof ThemeColors;

export interface ColorInputProps extends InputProps {
  colorKey: Color;
  value?: string;
  computedValue?: string;
  setValue?: (value: string) => void;
}

const ColorInput = forwardRef<ElementRef<'input'>, ColorInputProps>(function ColorInput(
  { colorKey, computedValue, rightNode, setValue, value, ...props },
  ref,
) {
  const { supported, open } = useEyeDropper();
  const { ref: focusRef, focused } = useFocusWithin();
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergedRef(ref, focusRef, inputRef);

  const pickColor = async () => {
    const toastId = toast(
      (t) => (
        <div className='flex items-center gap-2.5 -mb-0.5'>
          <span className='shrink-0 text-size-lg text-main'>{t.icon}</span>
          <Text className='leading-tight'>
            Press <Key className='text-sm'>esc</Key> to cancel selection.
          </Text>
        </div>
      ),
      { duration: Infinity, icon: <RiForbidFill /> },
    );
    try {
      const { sRGBHex } = (await open())!;
      setValue?.(sRGBHex);
    } catch (e) {
      toast.error(`Something went wrong! ${(e as Error).message}`);
    } finally {
      inputRef.current?.focus();
      toast.dismiss(toastId);
    }
  };

  return (
    <Input
      ref={mergedRef}
      label={LABELS[colorKey]}
      leftNode={
        <ColorPicker color={computedValue ?? value ?? ''} onChange={(color) => setValue?.(color)} />
      }
      rightNode={
        <>
          {supported && focused && (
            <Tooltip label='Pick color'>
              <Button className='p-0' tabIndex={-1} onMouseDown={() => void pickColor()}>
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

export default ColorInput;
