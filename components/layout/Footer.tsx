'use client';

import { Button, Flex, Key, Tooltip, Transition } from 'components/core';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { useTheme } from 'context/themeContext';
import project from 'package.json';
import { RiGitBranchLine, RiGithubLine, RiLoaderLine, RiPaletteFill } from 'react-icons/ri';

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
      <Flex className='justify-between'>
        <Flex className='gap-6'>
          <Button
            className='p-0 text-sm'
            component='a'
            href='https://github.com/nekusu'
            target='_blank'
            rel='noopener noreferrer'
          >
            <RiGithubLine />
            nekusu
          </Button>
        </Flex>
        <Flex className='gap-6'>
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
            <Button
              className='p-0 text-sm'
              component='a'
              href={`https://github.com/nekusu/apetype/releases/tag/v${project.version}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <RiGitBranchLine />v{project.version}
            </Button>
          </Tooltip>
        </Flex>
      </Flex>
    </Transition>
  );
}
