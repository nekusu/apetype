'use client';

import { Text } from 'components/core';
import Button, { ButtonProps } from 'components/core/Button';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { Children, Fragment, ReactNode } from 'react';
import { twJoin, twMerge } from 'tailwind-merge';
import { Settings, settingsList } from 'utils/settings';

type Option = { alt?: string; value: Settings[keyof Settings] };
export interface SettingProps {
  buttonProps?: (({ alt, value }: Option) => ButtonProps) | ButtonProps;
  children?: ReactNode;
  columns?: number;
  customButtons?: ({ alt, value }: Option) => ReactNode;
  customDescription?: (description: ReactNode) => ReactNode;
  fullWidth?: boolean;
  id: keyof typeof settingsList;
}

export default function Setting({
  buttonProps = {},
  children,
  columns,
  customButtons,
  customDescription,
  fullWidth,
  id,
}: SettingProps) {
  const { settingsList, commandLine } = useGlobal();
  const { command, description: originalDescription, options } = settingsList[id];
  const description = customDescription
    ? customDescription(originalDescription)
    : originalDescription;
  const settings = useSettings();
  const { setSettings } = settings;
  const childrenCount = options.length < 16 ? Children.count(children) + options.length : 1;
  const twoColumns = (fullWidth == null && !!description) || childrenCount === 1;

  return (
    <div className={twJoin(['grid gap-x-5 gap-y-1.5', twoColumns && 'grid-cols-[2fr_1.2fr]'])}>
      <Text asChild className='text-lg'>
        <h3>{command}</h3>
      </Text>
      {description && (
        <Text className={twJoin(['text-sm', twoColumns && 'row-start-2'])} dimmed>
          {description}
        </Text>
      )}
      <div
        className={twJoin(['grid gap-2 self-center', twoColumns && !!description && 'row-span-2'])}
        style={{ gridTemplateColumns: `repeat(${columns ? columns : childrenCount}, 1fr)` }}
      >
        {options.length < 16 ? (
          options.map(({ alt, value }) => {
            const { className, ...props } =
              typeof buttonProps === 'function' ? buttonProps({ alt, value }) : buttonProps;
            return (
              <Fragment key={alt ?? value.toString()}>
                {customButtons?.({ alt, value }) || (
                  <Button
                    active={settings[id as keyof Settings] === value}
                    className={twMerge(['w-full', className])}
                    onClick={() =>
                      setSettings((draft) => void (draft[id as keyof Settings] = value as never))
                    }
                    variant='filled'
                    {...props}
                  >
                    {alt ?? value.toString()}
                  </Button>
                )}
              </Fragment>
            );
          })
        ) : (
          <Button className='w-full' onClick={() => commandLine.handler?.open(id)} variant='filled'>
            {settings[id as keyof Settings] as ReactNode}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
