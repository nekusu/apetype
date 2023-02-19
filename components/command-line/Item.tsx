'use client';

import { Key } from 'components/core';
import { useSettings } from 'context/settingsContext';
import { HTMLMotionProps, motion } from 'framer-motion';
import { ReactNode } from 'react';
import { RiCheckLine } from 'react-icons/ri';
import { twJoin, twMerge } from 'tailwind-merge';

export interface ItemProps extends HTMLMotionProps<'div'> {
  active?: boolean;
  children?: ReactNode;
  label?: string;
  selected?: boolean;
}

export default function Item({
  active,
  children,
  className,
  label,
  selected,
  ...props
}: ItemProps) {
  const { keyTips } = useSettings();

  return (
    <motion.div
      className={twMerge([
        'flex h-9 cursor-pointer items-center gap-2 px-4 text-sm',
        active ? 'bg-main text-bg' : selected ? 'text-text' : 'bg-transparent text-sub',
        active && selected && 'bg-text',
        className,
      ])}
      layoutId={label}
      transition={{ ease: 'easeOut', duration: 0.175 }}
      {...props}
    >
      <div className='flex-1'>{label}</div>
      {keyTips && active && !selected && (
        <div className='flex items-center gap-1 text-xs'>
          select
          <Key className={twJoin(['bg-bg', selected ? 'text-text' : 'text-main'])}>enter</Key>
        </div>
      )}
      {selected && <RiCheckLine size={18} />}
      {children}
    </motion.div>
  );
}
