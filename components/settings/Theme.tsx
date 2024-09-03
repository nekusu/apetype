'use client';

import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import { Button, Text } from 'components/core';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { useTheme } from 'context/themeContext';
import { useMemo } from 'react';
import { Settings } from 'utils/settings';
import { CustomTheme, ThemeButton } from '.';

extend([a11yPlugin]);
const THEME_TYPES: Settings['themeType'][] = ['preset', 'custom'];

export default function Theme() {
  const { settingsList } = useGlobal();
  const { theme, themeType, setSettings } = useSettings();
  const { themes, isLoading } = useTheme();
  const sortedOptions = useMemo(() => {
    const { options } = settingsList.theme;
    return [...options].sort((a, b) => {
      const bgColorA = colord(themes[a.value].bg);
      const bgColorB = colord(themes[b.value].bg);
      return bgColorB.brightness() - bgColorA.brightness();
    });
  }, [settingsList.theme, themes]);

  return (
    <div className='grid auto-rows-auto grid-cols-[2fr_1.2fr] gap-x-5 gap-y-4'>
      <Text asChild className='text-lg'>
        <h3>{settingsList.theme.command}</h3>
      </Text>
      <div className='flex items-center gap-2'>
        {THEME_TYPES.map((type) => (
          <Button
            key={type}
            className='w-full'
            variant='filled'
            active={themeType === type}
            onClick={() => setSettings((draft) => void (draft.themeType = type))}
          >
            {type}
          </Button>
        ))}
      </div>
      {themeType === 'preset' ? (
        <div className='grid col-span-full grid-cols-[repeat(4,1fr)] items-center gap-2'>
          {sortedOptions.map(({ value }) => {
            const selectedTheme = themes[value];
            const selected = theme === value;
            return (
              <ThemeButton
                key={value}
                name={value}
                loading={isLoading}
                selected={selected}
                onClick={() => setSettings((draft) => void (draft.theme = value))}
                colors={{ ...selectedTheme }}
              />
            );
          })}
        </div>
      ) : (
        <CustomTheme className='col-span-full' />
      )}
    </div>
  );
}
