'use client';

import { Transition } from '@/components/core/Transition';
import { LogoIcon, type LogoIconProps } from '@/components/layout/LogoIcon';
import { type HTMLMotionProps, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

export interface LoadingProps extends HTMLMotionProps<'div'> {
  logoIconProps?: Partial<LogoIconProps>;
}

export default function Loading({
  className,
  logoIconProps: { className: logoIconClassName, ...logoIconProps } = {},
  ...props
}: LoadingProps) {
  const animationControls = useAnimation();

  useEffect(() => {
    animationControls.start({
      pathOffset: [0, 1, 2],
      transition: { repeat: Number.POSITIVE_INFINITY, duration: 1 },
    });
  }, [animationControls]);

  return (
    <Transition
      className={twMerge('flex items-center justify-center', className)}
      transition={{ duration: 0.5 }}
      {...props}
    >
      <LogoIcon
        className={twMerge('animate-pulse-alt stroke-sub', logoIconClassName)}
        width='70'
        controls={animationControls}
        {...logoIconProps}
      />
    </Transition>
  );
}
