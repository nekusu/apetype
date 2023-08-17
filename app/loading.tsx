'use client';

import { Transition } from 'components/core';
import { LogoIcon } from 'components/layout';
import { LogoIconProps } from 'components/layout/LogoIcon';
import { HTMLMotionProps, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

export interface LoadingProps extends HTMLMotionProps<'div'> {
  logoIconProps?: Partial<LogoIconProps>;
}

export default function Loading({
  className,
  logoIconProps: _logoIconProps,
  ...props
}: LoadingProps) {
  const { className: logoIconClassName, ...logoIconProps } = _logoIconProps ?? {};
  const animationControls = useAnimation();

  useEffect(() => {
    void animationControls.start({
      pathOffset: [0, 1, 2],
      transition: { repeat: Infinity, duration: 1 },
    });
  }, [animationControls]);

  return (
    <Transition
      className={twMerge(['flex items-center justify-center', className])}
      transition={{ duration: 0.5 }}
      {...props}
    >
      <LogoIcon
        className={twMerge(['animate-pulse-alt stroke-sub', logoIconClassName])}
        width='70'
        controls={animationControls}
        {...logoIconProps}
      />
    </Transition>
  );
}
