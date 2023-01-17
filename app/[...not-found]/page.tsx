'use client';

import { Button, Text, Transition } from 'components/core';
import Link from 'next/link';
import { RiKeyboardBoxFill } from 'react-icons/ri';

export default function NotFound() {
  return (
    <Transition className='flex cursor-default flex-col items-center gap-6 self-center'>
      <Text className='!text-[120px] font-bold leading-none' dimmed>
        404
      </Text>
      <Text className='text-center'>Looks like you found a page that doesn&apos;t exist.</Text>
      <Button className='!gap-2.5 py-3 px-4' component={Link} href='/' variant='filled'>
        <RiKeyboardBoxFill />
        Go Home
      </Button>
    </Transition>
  );
}
