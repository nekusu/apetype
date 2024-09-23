import { Button } from '@/components/core/Button';
import { Text } from '@/components/core/Text';
import { Transition } from '@/components/core/Transition';
import Link from 'next/link';
import { RiKeyboardBoxFill } from 'react-icons/ri';

export default function NotFound() {
  return (
    <Transition className='flex cursor-default flex-col items-center gap-6 self-center'>
      <Text className='font-bold text-9xl leading-none' dimmed>
        404
      </Text>
      <Text className='text-center'>Looks like you found a page that doesn't exist.</Text>
      <Button asChild className='gap-2.5 px-4 py-3'>
        <Link href='/'>
          <RiKeyboardBoxFill />
          Go Home
        </Link>
      </Button>
    </Transition>
  );
}
