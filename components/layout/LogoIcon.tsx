'use client';

import { type AnimationControls, type SVGMotionProps, m } from 'framer-motion';
import { type ComponentPropsWithoutRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

export interface LogoIconProps extends ComponentPropsWithoutRef<'svg'> {
  controls: AnimationControls;
  pathProps?: SVGMotionProps<SVGPathElement>;
  rectProps?: SVGMotionProps<SVGRectElement>;
}

export function LogoIcon({ className, controls, pathProps, rectProps, ...props }: LogoIconProps) {
  const _pathProps: typeof pathProps = useMemo(
    () => ({
      variants: {
        hidden: { pathLength: 0 },
        visible: {
          pathLength: 1,
          transition: { duration: 1 },
        },
      },
      initial: 'hidden',
      animate: 'visible',
      ...pathProps,
    }),
    [pathProps],
  );

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='35'
      viewBox='0 0 251 175'
      fill='none'
      strokeWidth='18'
      strokeLinecap='round'
      className={twMerge('transition-colors', className)}
      {...props}
    >
      <m.path d='M123.961 49.6772H126.685' {..._pathProps} />
      <m.path d='M162.102 49.6772L202.968 49.6772' {..._pathProps} />
      <m.path d='M47.6772 125.961H50.4017' {..._pathProps} />
      <m.path d='M200.925 125.961H202.287' {..._pathProps} />
      <m.path d='M57.2126 78.2835H79.0079' {..._pathProps} />
      <m.path d='M85.8188 125.961H126.685' {..._pathProps} />
      <m.path d='M163.465 96.6732L163.465 125.961' {..._pathProps} />
      <m.path d='M125.323 87.8189L201.606 87.8189' {..._pathProps} />
      <m.path
        d='M49.0393 88.5V67.3858C49.0393 61.2559 49.5842 48.315 68.1102
        48.315C86.6362 48.315 87.181 59.8937 87.181 67.3858V88.5'
        {..._pathProps}
      />
      <m.rect
        x='10.2166'
        y='10.8543'
        width='230.213'
        height='153.929'
        rx='34.7362'
        initial={{ pathLength: 1 }}
        animate={controls}
        {...rectProps}
      />
    </svg>
  );
}
