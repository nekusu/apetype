import { colord } from 'colord';
import { HexAlphaColorPicker } from 'react-colorful';
import { twMerge } from 'tailwind-merge';
import { Popover, type PopoverOptions } from './Popover';

export interface ColorPickerProps extends PopoverOptions {
  color: string;
  onChange: (color: string) => void;
  triggerClassName?: string;
}

export function ColorPicker({
  color,
  onChange,
  triggerClassName,
  offset = 14,
  ...props
}: ColorPickerProps) {
  const hexString = colord(color).toHex();
  return (
    <Popover.Root offset={offset} {...props}>
      <Popover.Trigger asChild>
        <div
          className={twMerge('cursor-pointer rounded-full border border-sub', triggerClassName)}
          style={{ minHeight: '1rem', minWidth: '1rem', background: hexString }}
        />
      </Popover.Trigger>
      <Popover.Content>
        <HexAlphaColorPicker
          color={hexString}
          onChange={onChange}
          className='!h-40 !w-40 rounded-lg shadow-lg'
        />
      </Popover.Content>
    </Popover.Root>
  );
}
