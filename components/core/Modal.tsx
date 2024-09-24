'use client';

import { useGlobal } from '@/context/globalContext';
import { FloatingPortal } from '@floating-ui/react';
import { useFocusTrap, useHotkeys } from '@mantine/hooks';
import { AnimatePresence, type HTMLMotionProps } from 'framer-motion';
import { type MouseEvent, useEffect } from 'react';
import { RemoveScroll } from 'react-remove-scroll';
import { twMerge } from 'tailwind-merge';
import { Transition } from './Transition';

export interface ModalProps extends HTMLMotionProps<'div'> {
  backdropClassName?: string;
  centered?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  id?: string;
  lockScroll?: boolean;
  opened: boolean;
  onClose?: () => void;
  overflow?: 'inside' | 'outside';
  target?: HTMLElement | null;
  trapFocus?: boolean;
}

export function Modal({
  backdropClassName,
  centered = true,
  className,
  closeOnClickOutside = true,
  closeOnEscape = true,
  id,
  lockScroll = true,
  opened,
  onClose,
  overflow = 'inside',
  target,
  trapFocus = true,
  ...props
}: ModalProps) {
  const { setGlobalValues } = useGlobal();
  const focusTrapRef = useFocusTrap(trapFocus && opened);

  const handleEscapePress = () => {
    if (closeOnEscape && opened) onClose?.();
  };
  const handleOutsideClick = (event: MouseEvent) => {
    if (closeOnClickOutside && event.target === event.currentTarget) onClose?.();
  };

  useEffect(() => {
    setGlobalValues({ modalOpened: opened });
  }, [opened, setGlobalValues]);
  useHotkeys([['Escape', handleEscapePress]], ['input']);

  return (
    <FloatingPortal id={id} root={target}>
      <AnimatePresence>
        {opened && (
          <RemoveScroll enabled={lockScroll && opened} forwardProps>
            <Transition
              className={twMerge(
                'inset-0 z-50 flex h-full w-full justify-center bg-black/50 px-8 py-16 backdrop-blur-[2.5px]',
                centered ? 'items-center' : 'items-start',
                overflow === 'outside' && 'overflow-y-auto',
                target ? 'absolute' : 'fixed',
                backdropClassName,
              )}
              onClick={handleOutsideClick}
            >
              <Transition
                ref={focusTrapRef}
                className={twMerge(
                  'relative cursor-default rounded-xl bg-bg p-6 shadow-2xl transition-colors',
                  overflow === 'inside' && 'max-h-full overflow-y-auto',
                  className,
                )}
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
