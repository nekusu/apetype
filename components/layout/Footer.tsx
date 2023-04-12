'use client';

import { Button, Key, Tooltip, Transition } from 'components/core';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { useTheme } from 'context/themeContext';
import { RiGitBranchLine, RiGithubLine, RiLoaderLine, RiPaletteFill } from 'react-icons/ri';
import { version } from 'utils/version';

export default function Footer() {
  const { commandLine } = useGlobal();
  const {
    themeType,
    theme,
    customThemes,
    customTheme: customThemeId,
    keyTips,
    setSettings,
  } = useSettings();
  const { isLoading } = useTheme();
  const customTheme = customThemes.find(({ id }) => id === customThemeId);

  return (
    <Transition className='w-full'>
      <div className='flex items-center justify-between gap-2'>
        <div className='gap-6'>
          <Button asChild className='p-0 text-sm'>
            <a href='https://github.com/nekusu' target='_blank' rel='noopener noreferrer'>
              <RiGithubLine />
              nekusu
            </a>
          </Button>
        </div>
        <div className='flex items-center gap-6'>
          <Tooltip
            label={
              <>
                <Key>shift</Key> + <Key>click</Key> to toggle custom theme
              </>
            }
            offset={8}
            placement='left'
            disabled={!keyTips}
          >
            <Button
              className='p-0 text-sm'
              onClick={(e) => {
                if (e.shiftKey)
                  setSettings(
                    (draft) => void (draft.themeType = themeType === 'preset' ? 'custom' : 'preset')
                  );
                else commandLine.handler?.open(themeType === 'preset' ? 'theme' : 'customTheme');
              }}
            >
              {isLoading ? <RiLoaderLine className='animate-spin' /> : <RiPaletteFill />}
              {themeType === 'custom' && customTheme ? `custom (${customTheme.name})` : theme}
            </Button>
          </Tooltip>
          <Tooltip label='See changelog' offset={8} placement='left'>
            <Button asChild className='p-0 text-sm'>
              <a
                href={`https://github.com/nekusu/apetype/releases/tag/v${version}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                <RiGitBranchLine />v{version}
              </a>
            </Button>
          </Tooltip>
        </div>
      </div>
    </Transition>
  );
}
