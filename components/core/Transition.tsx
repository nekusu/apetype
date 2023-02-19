import { HTMLMotionProps, motion, Variants } from 'framer-motion';
import { forwardRef } from 'react';

const DEFAULT_VARIANTS: Variants = {
  hidden: { opacity: 0, pointerEvents: 'none' },
  visible: { opacity: 1, pointerEvents: 'auto' },
};

const Transition = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(function Transition(
  { variants = DEFAULT_VARIANTS, ...props },
  ref
) {
  return (
    <motion.div
      variants={variants}
      initial={variants.hidden ? 'hidden' : 'initial'}
      animate={variants.visible ? 'visible' : 'animate'}
      exit={variants.hidden ? 'hidden' : 'exit'}
      transition={{ duration: 0.15 }}
      ref={ref}
      {...props}
    />
  );
});

export default Transition;
