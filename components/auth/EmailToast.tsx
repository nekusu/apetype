'use client';

import { Button, Text } from 'components/core';
import { Toast, resolveValue, toast } from 'react-hot-toast';
import { RiInformationFill } from 'react-icons/ri';

export interface EmailToastProps extends Toast {
  emailDomain: string;
}

export default function EmailToast({ emailDomain, ...t }: EmailToastProps) {
  const resolvedValue = resolveValue(t.message, t);

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-2.5'>
        <span className='shrink-0 text-lg text-main'>
          <RiInformationFill />
        </span>
        <Text className='leading-tight'>{resolvedValue}</Text>
      </div>
      <div className='flex gap-2'>
        <Button className='w-full' variant='subtle' onClick={() => toast.dismiss(t.id)}>
          dismiss
        </Button>
        <Button asChild active className='w-full' variant='filled'>
          <a href={`https://${emailDomain}`} target='_blank' rel='noopener noreferrer'>
            open email
          </a>
        </Button>
      </div>
    </div>
  );
}
