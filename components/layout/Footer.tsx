'use client';

import { Button, Flex, Tooltip, Transition } from 'components/core';
import project from 'package.json';
import { RiGitBranchLine, RiGithubLine } from 'react-icons/ri';

export default function Footer() {
  return (
    <Transition className='w-full'>
      <Flex className='justify-between'>
        <Flex className='gap-1'>
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
        <Flex className='gap-1'>
          <Tooltip label='See changelog' offset={10}>
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
