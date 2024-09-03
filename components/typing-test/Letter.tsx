'use client';

import { forwardRef, memo, useCallback } from 'react';
import { twJoin } from 'tailwind-merge';
import { Settings } from 'utils/settings';
import { Letter as LetterType } from 'utils/typingTest';

type LetterProps = LetterType &
  Partial<
    Pick<
      Settings,
      'blindMode' | 'indicateTypos' | 'hideExtraLetters' | 'flipTestColors' | 'colorfulMode'
    >
  >;

const Letter = forwardRef<HTMLSpanElement, LetterProps>(function Letter(
  {
    original,
    typed,
    status,
    blindMode,
    indicateTypos,
    hideExtraLetters,
    flipTestColors,
    colorfulMode,
  },
  ref,
) {
  const color = useCallback(
    (status: LetterType['status']) => {
      switch (status) {
        case 'correct':
          if (flipTestColors) return 'text-sub';
          return colorfulMode ? 'text-main' : 'text-text';
        case 'incorrect':
          return colorfulMode ? 'text-colorful-error' : 'text-error';
        case 'extra':
          return colorfulMode ? 'text-colorful-error-extra' : 'text-error-extra';
        default:
          if (flipTestColors) return colorfulMode ? 'text-main' : 'text-text';
          return 'text-sub';
      }
    },
    [colorfulMode, flipTestColors],
  );

  return (
    <span
      className={twJoin(
        'relative inline-block',
        (blindMode || hideExtraLetters) && status === 'extra' && 'hidden',
        blindMode && !!status ? color('correct') : color(status),
      )}
      ref={ref}
    >
      {!blindMode && indicateTypos === 'replace' && typed && typed !== ' '
        ? typed
        : typed === ' ' && status === 'extra'
          ? '_'
          : original}
      {!blindMode && indicateTypos === 'below' && status === 'incorrect' && (
        <span className='absolute left-0 top-[1.35em] w-full flex justify-center text-[.75em] text-text opacity-50'>
          {typed}
        </span>
      )}
    </span>
  );
});

export default memo(Letter);
