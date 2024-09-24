'use client';

import { Button } from '@/components/core/Button';
import { Group } from '@/components/core/Group';
import { Text } from '@/components/core/Text';
import { type Toast, resolveValue, toast } from 'react-hot-toast';
import { RiInformationFill } from 'react-icons/ri';

export interface EmailToastProps extends Toast {
  emailDomain: string;
}

export function EmailToast({ emailDomain, ...t }: EmailToastProps) {
  const resolvedValue = resolveValue(t.message, t);
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-2.5'>
        <span className='shrink-0 text-lg text-main'>
          <RiInformationFill />
        </span>
        <Text className='leading-tight'>{resolvedValue}</Text>
      </div>
      <Group>
        <Button onClick={() => toast.dismiss(t.id)} variant='subtle'>
          dismiss
        </Button>
        <Button asChild active>
          <a href={`https://${emailDomain}`} target='_blank' rel='noopener noreferrer'>
            open email
          </a>
        </Button>
      </Group>
    </div>
  );
}
