'use client';

import { Key } from '@/components/core/Key';
import { Tooltip } from '@/components/core/Tooltip';
import { useSettings } from '@/context/settingsContext';
import { type HTMLMotionProps, m } from 'framer-motion';
import type { ReactNode } from 'react';
import { RiCheckLine, RiQuestionLine } from 'react-icons/ri';
import { twJoin, twMerge } from 'tailwind-merge';

export interface ItemProps extends HTMLMotionProps<'div'> {
  active?: boolean;
  children?: ReactNode;
  description?: ReactNode;
  label?: string;
  selected?: boolean;
}

export default function Item({
  active,
  children,
  className,
  description,
  label,
  selected,
  ...props
}: ItemProps) {
  const { keyTips } = useSettings();

  return (
    <m.div
      className={twMerge(
        'flex h-9 cursor-pointer items-center gap-2 px-4 text-sm',
        active ? 'bg-main text-bg' : selected ? 'text-text' : 'bg-transparent text-sub',
        active && selected && 'bg-text',
        className,
      )}
      layoutId={label}
      transition={{ ease: 'easeOut', duration: 0.175 }}
      {...props}
    >
      <div className='flex-1'>{label}</div>
      {keyTips && active && !selected && (
        <div className='flex items-center gap-1 text-xs'>
          select
          <Key className={twJoin('bg-bg', selected ? 'text-text' : 'text-main')}>enter</Key>
        </div>
      )}
      {selected && <RiCheckLine size={18} />}
      {children}
      {description && (
        <Tooltip
          className='z-50 max-w-[min(550px,70vw)] text-xs'
          label={description}
          placement='left'
        >
          <div className='cursor-help'>
            <RiQuestionLine size={18} />
          </div>
        </Tooltip>
      )}
    </m.div>
  );
}
