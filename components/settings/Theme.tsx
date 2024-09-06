'use client';

import { Button, Grid, Group, Text } from '@/components/core';
import { useGlobal } from '@/context/globalContext';
import { useSettings } from '@/context/settingsContext';
import { useTheme } from '@/context/themeContext';
import type { Settings } from '@/utils/settings';
import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import { useMemo } from 'react';
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
    <Grid className='grid-cols-[2fr_1.2fr] gap-x-5 gap-y-4'>
      <Text asChild className='text-lg'>
        <h3>{settingsList.theme.command}</h3>
      </Text>
      <Group>
        {THEME_TYPES.map((type) => (
          <Button
            key={type}
            active={themeType === type}
            onClick={() =>
              setSettings((draft) => {
                draft.themeType = type;
              })
            }
          >
            {type}
          </Button>
        ))}
      </Group>
      {themeType === 'preset' ? (
        <Grid className='col-span-full grid-cols-[repeat(4,1fr)] items-center'>
          {sortedOptions.map(({ value }) => {
            const selectedTheme = themes[value];
            const selected = theme === value;
            return (
              <ThemeButton
                key={value}
                name={value}
                loading={isLoading}
                selected={selected}
                onClick={() =>
                  setSettings((draft) => {
                    draft.theme = value;
                  })
                }
                colors={{ ...selectedTheme }}
              />
            );
          })}
        </Grid>
      ) : (
        <CustomTheme className='col-span-full' />
      )}
    </Grid>
  );
}
