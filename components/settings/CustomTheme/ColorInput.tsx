import { useEyeDropper, useFocusWithin, useMergedRef } from '@mantine/hooks';
import { Button, ColorPicker, Input, Key, Text, Tooltip } from 'components/core';
import { InputProps } from 'components/core/Input';
import { useRef } from 'react';
import toast from 'react-hot-toast';
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
  value: string;
  computedValue?: string;
  setValue: (value: string) => void;
}

export default function ColorInput({
  colorKey,
  value,
  computedValue,
  rightNode,
  setValue,
  ...props
}: ColorInputProps) {
  const { supported, open } = useEyeDropper();
  const { ref, focused } = useFocusWithin();
  const inputRef = useRef<HTMLInputElement>(null);
  const mergedRef = useMergedRef(ref, inputRef);

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
      const { sRGBHex } = await open();
      setValue(sRGBHex);
    } catch (e) {
      console.error(e);
    } finally {
      inputRef.current?.focus();
      toast.dismiss(toastId);
    }
  };

  return (
    <Input
      ref={mergedRef}
      tabIndex={0}
      label={LABELS[colorKey]}
      leftNode={
        <ColorPicker color={computedValue ?? value} onChange={(color) => setValue(color)} />
      }
      rightNode={
        <div className='flex gap-1.5'>
          {supported && focused && (
            <Tooltip label='Pick color'>
              <Button className='p-0' tabIndex={-1} onMouseDown={() => void pickColor()}>
                <RiSipLine />
              </Button>
            </Tooltip>
          )}
          {rightNode}
        </div>
      }
      value={value}
      onChange={({ target: { value } }) => setValue(value)}
      {...props}
    />
  );
}
