'use client';

import { forwardRef, memo, useMemo } from 'react';
import { twJoin } from 'tailwind-merge';
import { Settings } from 'utils/settings';
import { Letter as LetterType } from 'utils/typingTest';

type LetterProps = LetterType &
  Partial<Pick<Settings, 'indicateTypos' | 'hideExtraLetters' | 'flipTestColors' | 'colorfulMode'>>;

const Letter = forwardRef<HTMLSpanElement, LetterProps>(function Letter(
  { original, typed, status, indicateTypos, hideExtraLetters, flipTestColors, colorfulMode },
  ref
) {
  const color = useMemo(() => {
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
  }, [colorfulMode, flipTestColors, status]);

  return (
    <span
      className={twJoin([
        'relative inline-block',
        hideExtraLetters && status === 'extra' ? 'hidden' : color,
      ])}
      ref={ref}
    >
      {indicateTypos === 'replace' && typed && typed !== ' ' ? typed : original}
      {indicateTypos === 'below' && status === 'incorrect' && (
        <span className='absolute left-0 top-[1.35em] w-full flex justify-center text-[.75em] text-text opacity-50'>
          {typed}
        </span>
      )}
    </span>
  );
});

export default memo(Letter);
