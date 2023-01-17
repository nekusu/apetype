'use client';

import clsx from 'clsx';
import { useGlobal } from 'context/globalContext';
import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

const PATH_PROPS = {
  variants: {
    hidden: { opacity: 0, pathLength: 0 },
    visible: {
      opacity: 1,
      pathLength: 1,
      transition: { delay: 0.1, duration: 1 },
    },
  },
  initial: 'hidden',
  animate: 'visible',
};

export default function LogoIcon() {
  const { isUserTyping } = useGlobal();
  const rectControls = useAnimation();

  useEffect(() => {
    if (!isUserTyping) {
      void rectControls.start({
        opacity: 1,
        pathOffset: [0, 1, 2],
        transition: { duration: 1 },
      });
    }
  }, [isUserTyping, rectControls]);

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      height='25'
      width='35'
      viewBox='0 0 251 175'
      fill='none'
      strokeWidth='18'
      strokeLinecap='round'
      className={clsx(['transition-colors', isUserTyping ? 'stroke-sub' : 'stroke-main'])}
    >
      <motion.path d='M123.961 49.6772H126.685' {...PATH_PROPS} />
      <motion.path d='M162.102 49.6772L202.968 49.6772' {...PATH_PROPS} />
      <motion.path d='M47.6772 125.961H50.4017' {...PATH_PROPS} />
      <motion.path d='M200.925 125.961H202.287' {...PATH_PROPS} />
      <motion.path d='M57.2126 78.2835H79.0079' {...PATH_PROPS} />
      <motion.path d='M85.8188 125.961H126.685' {...PATH_PROPS} />
      <motion.path d='M163.465 96.6732L163.465 125.961' {...PATH_PROPS} />
      <motion.path d='M125.323 87.8189L201.606 87.8189' {...PATH_PROPS} />
      <motion.path
        d='M49.0393 88.5V67.3858C49.0393 61.2559 49.5842 48.315 68.1102
        48.315C86.6362 48.315 87.181 59.8937 87.181 67.3858V88.5'
        {...PATH_PROPS}
      />
      <motion.rect
        x='10.2166'
        y='10.8543'
        width='230.213'
        height='153.929'
        rx='34.7362'
        initial={{ opacity: 0, pathLength: 1 }}
        animate={rectControls}
      />
    </svg>
  );
}
