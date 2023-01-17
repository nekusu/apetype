'use client';

import {
  flip,
  offset as offsetMiddleware,
  Placement,
  shift,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
} from '@floating-ui/react';
import { useMergedRef } from '@mantine/hooks';
import clsx from 'clsx';
import { AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { cloneElement, forwardRef, ReactNode, useState } from 'react';
import Transition from './Transition';

export interface TooltipProps extends HTMLMotionProps<'div'> {
  label: ReactNode;
  offset?: number;
  placement?: Placement;
}

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(function Tooltip(
  { children, className, label, offset = 4, placement = 'bottom', ...props },
  ref
) {
  const [open, setOpen] = useState(false);
  const { context, x, y, reference, floating, strategy } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: placement,
    middleware: [offsetMiddleware(offset), flip(), shift()],
  });
  const hover = useHover(context);
  const focus = useFocus(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus]);
  const mergedRef = useMergedRef(ref, floating);

  return (
    <>
      {cloneElement(children as JSX.Element, getReferenceProps({ ref: reference }))}
      <AnimatePresence>
        {open && (
          <Transition
            className={clsx([
              'pointer-events-none rounded-lg bg-sub-alt py-2 px-3 text-center text-sm leading-tight text-text shadow-md transition',
              className,
            ])}
            ref={mergedRef}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              width: 'max-content',
            }}
            {...getFloatingProps()}
            {...props}
          >
            {label}
          </Transition>
        )}
      </AnimatePresence>
    </>
  );
});

export default Tooltip;
