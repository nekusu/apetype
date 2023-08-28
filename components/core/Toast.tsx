'use client';

import { Text, Transition } from 'components/core';
import { AnimatePresence, HTMLMotionProps, m, useAnimation } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Toast, resolveValue, toast, useToasterStore } from 'react-hot-toast';
import { twJoin, twMerge } from 'tailwind-merge';

export interface ToastProps extends HTMLMotionProps<'div'> {
  progressBarProps?: HTMLMotionProps<'div'>;
  t: Toast;
}

export default function Toast({
  className,
  progressBarProps: _progressBarProps,
  t,
  ...props
}: ToastProps) {
  const { className: progressBarClassName, ...progressBarProps } = _progressBarProps ?? {};
  const { pausedAt } = useToasterStore();
  const animationControls = useAnimation();
  const duration = useRef(0);
  const startTimestamp = useRef(0);
  const resolvedValue = resolveValue(t.message, t);

  useEffect(() => {
    if (!duration.current && t.duration && t.duration !== Infinity)
      duration.current = t.duration / 1000;
    if (pausedAt) {
      animationControls.stop();
      if (duration.current && startTimestamp.current) {
        const elapsedTime = (performance.now() - startTimestamp.current) / 1000;
        duration.current -= elapsedTime;
      }
    } else if (duration.current) {
      void animationControls.start({
        width: 0,
        transition: { ease: 'linear', duration: duration.current },
      });
      startTimestamp.current = performance.now();
    }
  }, [animationControls, pausedAt, t.duration]);

  return (
    <AnimatePresence>
      {t.visible && (
        <Transition
          className={twMerge([
            'relative rounded-lg min-w-xs cursor-default max-w-xs overflow-hidden bg-sub-alt text-text px-4 pt-3 pb-3.5 shadow-xl transition-colors',
            className,
            t.className,
          ])}
          variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
          transition={{ scale: { type: 'spring', bounce: 0.6 } }}
          onClick={() => toast.dismiss(t.id)}
          {...props}
        >
          {typeof resolvedValue === 'object' ? (
            resolvedValue
          ) : (
            <div className='flex items-center gap-2.5'>
              {t.icon && (
                <span
                  className={twJoin([
                    'shrink-0 text-size-lg',
                    t.type === 'error' ? 'text-error' : 'text-main',
                  ])}
                >
                  {t.icon}
                </span>
              )}
              <Text className='leading-tight'>{resolvedValue}</Text>
            </div>
          )}
          {!!t.duration && t.duration !== Infinity && (
            <m.div
              className={twJoin([
                'absolute bottom-0 left-0 h-1 rounded transition-colors',
                t.type === 'error' ? 'bg-error-extra' : 'bg-sub',
                progressBarClassName,
              ])}
              initial={{ width: '100%' }}
              animate={animationControls}
              {...progressBarProps}
            />
          )}
        </Transition>
      )}
    </AnimatePresence>
  );
}
