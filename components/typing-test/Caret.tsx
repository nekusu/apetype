'use client';

import { useGlobal } from '@/context/globalContext';
import { useSettings } from '@/context/settingsContext';
import { m } from 'framer-motion';
import type { CSSProperties } from 'react';
import { twJoin } from 'tailwind-merge';

export interface CaretProps {
  width: CSSProperties['width'];
  x: number;
  y: number;
}

export function Caret({ width = '.5em', x, y }: CaretProps) {
  const { isUserTyping } = useGlobal();
  const { smoothCaret, caretStyle, fontSize } = useSettings();

  return (
    <m.div
      initial={{ left: fontSize * 4, top: fontSize * 4 }}
      animate={{
        opacity: smoothCaret ? [1, isUserTyping ? 1 : 0, 1] : undefined,
        left: x,
        top: y,
        transition: {
          opacity: { repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut', duration: 1 },
          width: { ease: 'linear', duration: smoothCaret ? 0.1 : 0 },
          default: { ease: 'easeOut', duration: smoothCaret ? 0.08 : 0 },
        },
      }}
      className={twJoin(
        'absolute rounded-[.1em]',
        caretStyle === 'outline' ? 'border-[.05em] border-caret bg-transparent' : 'bg-caret',
        caretStyle === 'underline' ? 'mt-[1.1em] h-[.1em]' : 'mt-[-.075em] h-[1.2em]',
        smoothCaret ? 'transition-[width] duration-75' : !isUserTyping && 'animate-caret-blink',
      )}
      style={{ width: caretStyle === 'default' ? '.1em' : width }}
    />
  );
}
