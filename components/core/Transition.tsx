'use client';

import { HTMLMotionProps, m, Variants } from 'framer-motion';
import { ElementRef, forwardRef } from 'react';

const DEFAULT_VARIANTS: Variants = {
  hidden: { opacity: 0, pointerEvents: 'none' },
  visible: { opacity: 1, pointerEvents: 'auto' },
};

const Transition = forwardRef<ElementRef<'div'>, HTMLMotionProps<'div'>>(function Transition(
  { variants = DEFAULT_VARIANTS, ...props },
  ref,
) {
  return (
    <m.div
      ref={ref}
      variants={variants}
      initial={variants.hidden ? 'hidden' : 'initial'}
      animate={variants.visible ? 'visible' : 'animate'}
      exit={variants.hidden ? 'hidden' : 'exit'}
      transition={{ duration: 0.15 }}
      {...props}
    />
  );
});

export default Transition;
