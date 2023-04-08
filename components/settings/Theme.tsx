'use client';

import { Button, Text } from 'components/core';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { useTheme } from 'context/themeContext';
import { useMemo } from 'react';
import tinycolor from 'tinycolor2';
import { ThemeType } from 'utils/settings';
import CustomTheme from './CustomTheme';
import ThemeButton from './ThemeButton';

const THEME_TYPES: ThemeType[] = ['preset', 'custom'];

export default function Theme() {
  const { settingsList } = useGlobal();
  const { theme, themeType, setSettings } = useSettings();
  const { themes, isLoading } = useTheme();
  const sortedOptions = useMemo(() => {
    const { options } = settingsList.theme;
    return [...options].sort((a, b) => {
      const bgColorA = tinycolor(themes[a.value].bg);
      const bgColorB = tinycolor(themes[b.value].bg);
      return bgColorB.getLuminance() - bgColorA.getLuminance();
    });
  }, [settingsList.theme, themes]);

  return (
    <div className='grid auto-rows-auto grid-cols-[2fr_1.2fr] gap-y-4 gap-x-5'>
      <Text className='text-lg' component='h3'>
        {settingsList.theme.command}
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
        <div className='col-span-full grid grid-cols-[repeat(4,_1fr)] items-center gap-2'>
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
