'use client';

import { FloatingPortal } from '@floating-ui/react';
import { useFocusTrap, useHotkeys } from '@mantine/hooks';
import { useGlobal } from 'context/globalContext';
import { AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { MouseEvent, useEffect } from 'react';
import { RemoveScroll } from 'react-remove-scroll';
import { twMerge } from 'tailwind-merge';
import Transition from './Transition';

export interface ModalProps extends HTMLMotionProps<'div'> {
  backdropClassName?: string;
  centered?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  id?: string;
  lockScroll?: boolean;
  open: boolean;
  onClose?: () => void;
  overflow?: 'inside' | 'outside';
  target?: HTMLElement | null;
  trapFocus?: boolean;
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
  trapFocus = true,
  ...props
}: ModalProps) {
  const { setGlobalValues } = useGlobal();
  const focusTrapRef = useFocusTrap(trapFocus && open);

  const handleEscapePress = () => {
    if (closeOnEscape && open) onClose?.();
  };
  const handleOutsideClick = (event: MouseEvent) => {
    if (closeOnClickOutside && event.target === event.currentTarget) onClose?.();
  };

  useEffect(() => {
    setGlobalValues((draft) => void (draft.modalOpen = open));
  }, [open, setGlobalValues]);
  useHotkeys([['Escape', handleEscapePress]], ['input']);

  return (
    <FloatingPortal id={id} root={target}>
      <AnimatePresence>
        {open && (
          <RemoveScroll enabled={lockScroll && open} forwardProps>
            <Transition
              className={twMerge([
                'inset-0 z-50 flex h-full w-full justify-center bg-black/50 py-16 px-8 backdrop-blur-[2.5px]',
                centered ? 'items-center' : 'items-start',
                overflow === 'outside' && 'overflow-y-auto',
                target ? 'absolute' : 'fixed',
                backdropClassName,
              ])}
              onClick={handleOutsideClick}
            >
              <Transition
                ref={focusTrapRef}
                className={twMerge([
                  'relative rounded-xl bg-bg p-6 shadow-2xl transition-colors cursor-default',
                  overflow === 'inside' && 'max-h-full overflow-y-auto',
                  className,
                ])}
                variants={{
                  hidden: { scale: 0.95, transition: { duration: 0.15 } },
                  visible: { scale: 1, transition: { type: 'spring', bounce: 0.6 } },
                }}
                {...props}
              />
            </Transition>
          </RemoveScroll>
        )}
      </AnimatePresence>
    </FloatingPortal>
  );
}
