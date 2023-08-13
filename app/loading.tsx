'use client';

import { Transition } from 'components/core';
import { LogoIcon } from 'components/layout';
import { useAnimation } from 'framer-motion';
import { useEffect } from 'react';

export default function Loading() {
  const animationControls = useAnimation();

  useEffect(() => {
    void animationControls.start({
      pathOffset: [0, 1, 2],
      transition: { repeat: Infinity, duration: 1 },
    });
  }, [animationControls]);

  return (
    <Transition className='flex items-center justify-center' transition={{ duration: 0.5 }}>
      <LogoIcon className='animate-pulse-alt stroke-sub' width='70' controls={animationControls} />
    </Transition>
  );
}
