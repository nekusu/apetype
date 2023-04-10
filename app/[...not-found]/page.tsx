import { Button, Text, Transition } from 'components/core';
import Link from 'next/link';
import { RiKeyboardBoxFill } from 'react-icons/ri';

export default function NotFound() {
  return (
    <Transition className='flex cursor-default flex-col items-center gap-6 self-center'>
      <Text className='text-[120px] font-bold leading-none' dimmed>
        404
      </Text>
      <Text className='text-center'>Looks like you found a page that doesn&apos;t exist.</Text>
      <Button asChild className='gap-2.5 px-4 py-3' variant='filled'>
        <Link href='/'>
          <RiKeyboardBoxFill />
          Go Home
        </Link>
      </Button>
    </Transition>
  );
}
