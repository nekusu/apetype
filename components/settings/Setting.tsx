'use client';

import { Text } from '@/components/core';
import Button, { type ButtonProps } from '@/components/core/Button';
import { useGlobal } from '@/context/globalContext';
import { useSettings } from '@/context/settingsContext';
import type { Settings, settingsList } from '@/utils/settings';
import { Children, Fragment, type ReactNode } from 'react';
import { twJoin } from 'tailwind-merge';

type Option<T extends keyof Settings> = { alt?: string; value: Settings[T] };
type ExtendedSettingProps<T extends keyof Settings> = {
  buttonProps?: (({ alt, value }: Option<T>) => ButtonProps) | ButtonProps;
  customButtons?: ({ alt, value }: Option<T>) => ReactNode;
};
export type SettingProps<T extends keyof typeof settingsList> = {
  children?: ReactNode;
  columns?: number;
  customDescription?: (description: ReactNode) => ReactNode;
  fullWidth?: boolean;
  id: T;
} & (T extends keyof Settings ? ExtendedSettingProps<T> : object);

export default function Setting<T extends keyof typeof settingsList>({
  children,
  columns,
  customDescription,
  fullWidth,
  id,
  ...props
}: SettingProps<T>) {
  const { buttonProps, customButtons } = props as ExtendedSettingProps<keyof Settings>;
  const { settingsList, commandLine } = useGlobal();
  const { command, description: originalDescription, options } = settingsList[id];
  const description = customDescription?.(originalDescription) ?? originalDescription;
  const settings = useSettings();
  const { setSettings } = settings;
  const childrenCount = options.length < 16 ? Children.count(children) + options.length : 1;
  const twoColumns = (fullWidth == null && !!description) || childrenCount === 1;

  return (
    <div className={twJoin('grid gap-x-5 gap-y-1.5', twoColumns && 'grid-cols-[2fr_1.2fr]')}>
      <Text asChild className='text-lg'>
        <h3>{command}</h3>
      </Text>
      {description && (
        <Text className={twJoin('text-sm', twoColumns && 'row-start-2')} dimmed>
          {description}
        </Text>
      )}
      <div
        className={twJoin(
          'grid gap-2 self-center [&>*]:w-full',
          twoColumns && !!description && 'row-span-2',
        )}
        style={{ gridTemplateColumns: `repeat(${columns ? columns : childrenCount}, 1fr)` }}
      >
        {options.length < 16 ? (
          options.map(({ alt, value }) => {
            const props =
              typeof buttonProps === 'function' ? buttonProps({ alt, value }) : buttonProps;
            return (
              <Fragment key={alt ?? value?.toString()}>
                {customButtons?.({ alt, value }) || (
                  <Button
                    active={settings[id as keyof Settings] === value}
                    onClick={() =>
                      setSettings((draft) => {
                        draft[id as keyof Settings] = value as never;
                      })
                    }
                    {...props}
                  >
                    {alt ?? value?.toString()}
                  </Button>
                )}
              </Fragment>
            );
          })
        ) : (
          <Button onClick={() => commandLine.handler.open(id)}>
            {settings[id as keyof Settings] as ReactNode}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
