'use client';

import { Button, Flex, Tooltip, Transition } from 'components/core';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import project from 'package.json';
import { RiGitBranchLine, RiGithubLine, RiLoaderLine, RiPaletteFill } from 'react-icons/ri';

export default function Footer() {
  const { isThemeLoading, commandLineHandler } = useGlobal();
  const { theme } = useSettings();

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
          <Button className='p-0 text-sm' onClick={() => commandLineHandler.open('theme')}>
            {isThemeLoading ? <RiLoaderLine className='animate-spin' /> : <RiPaletteFill />}
            {theme}
          </Button>
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
