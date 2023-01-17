'use client';

import { FloatingPortal } from '@floating-ui/react';
import { useHotkeys, useScrollLock } from '@mantine/hooks';
import clsx from 'clsx';
import { AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { MouseEvent, useEffect } from 'react';
import Transition from './Transition';

export interface ModalProps extends HTMLMotionProps<'div'> {
  backdropClassName?: string;
  centered?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  id?: string;
  lockScroll?: boolean;
  open: boolean;
  onClose: () => void;
  overflow?: 'inside' | 'outside';
  target?: HTMLElement | null;
}

export default function Modal({
  backdropClassName,
  centered = false,
  className,
  closeOnClickOutside = true,
  closeOnEscape = true,
  id,
  lockScroll = true,
  open,
  onClose,
  overflow = 'inside',
  target,
  ...props
}: ModalProps) {
  const [, setScrollLocked] = useScrollLock();

  const handleEscapePress = () => {
    if (closeOnEscape) onClose();
  };
  const handleOutsideClick = (event: MouseEvent) => {
    if (closeOnClickOutside && event.target === event.currentTarget) onClose();
  };

  useEffect(() => {
    setScrollLocked(lockScroll && open);
  }, [lockScroll, open, setScrollLocked]);
  useHotkeys([['Escape', handleEscapePress]], ['input']);

  return (
    <FloatingPortal id={id} root={target}>
      <AnimatePresence>
        {open && (
          <Transition
            className={clsx([
              'inset-0 z-50 flex h-full w-full justify-center bg-black/50 py-16 px-8 backdrop-blur-[2.5px]',
              centered ? 'items-center' : 'items-start',
              overflow === 'outside' && 'overflow-y-auto',
              target ? 'absolute' : 'fixed',
              backdropClassName,
            ])}
            onClick={handleOutsideClick}
          >
            <Transition
              className={clsx([
                'relative rounded-lg bg-bg p-6 shadow-2xl transition-colors',
                overflow === 'inside' && 'max-h-full overflow-y-auto',
                className,
              ])}
              variants={{
                hidden: { y: 10 },
                visible: { y: 0 },
              }}
              {...props}
            />
          </Transition>
        )}
      </AnimatePresence>
    </FloatingPortal>
  );
}
