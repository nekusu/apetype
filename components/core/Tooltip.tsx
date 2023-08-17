'use client';

import {
  autoUpdate,
  flip,
  FloatingPortal,
  offset as offsetMiddleware,
  Placement,
  shift,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
} from '@floating-ui/react';
import { useMergedRef } from '@mantine/hooks';
import { AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { cloneElement, forwardRef, ReactNode, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import Transition from './Transition';

export interface TooltipProps extends HTMLMotionProps<'div'> {
  disabled?: boolean;
  label: ReactNode;
  offset?: number;
  placement?: Placement;
}

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  { children, className, disabled, label, offset = 4, style, placement = 'bottom', ...props },
  ref,
) {
  const [open, setOpen] = useState(false);
  const { context, x, y, refs, strategy } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: placement,
    whileElementsMounted: autoUpdate,
    middleware: [offsetMiddleware(offset), flip(), shift()],
  });
  const hover = useHover(context);
  const focus = useFocus(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus]);
  const mergedRef = useMergedRef(ref, refs.setFloating);

  return (
    <>
      {cloneElement(children as JSX.Element, getReferenceProps({ ref: refs.setReference }))}
      <FloatingPortal>
        <AnimatePresence>
          {open && !disabled && (
            <Transition
              className={twMerge([
                'pointer-events-none rounded-lg bg-sub-alt px-3 py-2 text-center text-sm leading-tight text-text shadow-md transition z-50',
                className,
              ])}
              ref={mergedRef}
              style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                width: 'max-content',
                ...style,
              }}
              {...getFloatingProps()}
              {...props}
            >
              {label}
            </Transition>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </>
  );
});

export default Tooltip;
