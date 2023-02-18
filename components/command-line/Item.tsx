'use client';

import { Key } from 'components/core';
import { HTMLMotionProps, motion } from 'framer-motion';
import { RiCheckLine } from 'react-icons/ri';
import { twJoin, twMerge } from 'tailwind-merge';

export interface ItemProps extends HTMLMotionProps<'div'> {
  active?: boolean;
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
  return (
    <motion.div
      className={twMerge([
        'flex h-9 cursor-pointer items-center gap-2 px-4 text-sm transition-colors duration-100 hover:duration-[0]',
        active && selected ? 'bg-text' : active ? 'bg-main' : 'bg-transparent',
        active ? 'text-bg' : selected ? 'text-text' : 'text-sub',
        className,
      ])}
      layoutId={label}
      transition={{ ease: 'easeOut', duration: 0.175 }}
      {...props}
    >
      <div className='flex-1'>{label}</div>
      {active && !selected && (
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
