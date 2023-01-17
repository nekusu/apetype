'use client';

import { Button, Flex, Transition } from 'components/core';
import { RiGithubLine } from 'react-icons/ri';

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
      </Flex>
    </Transition>
  );
}
