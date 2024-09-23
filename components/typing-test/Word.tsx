'use client';

import type { Settings } from '@/utils/settings';
import type { Letter as LetterType } from '@/utils/typingTest';
import { type MutableRefObject, forwardRef, memo, useMemo } from 'react';
import { twJoin } from 'tailwind-merge';
import { Letter } from './Letter';

export interface WordProps
  extends Pick<
    Settings,
    'blindMode' | 'indicateTypos' | 'hideExtraLetters' | 'flipTestColors' | 'colorfulMode'
  > {
  letters: LetterType[];
  letterRef: MutableRefObject<HTMLSpanElement>;
  error: boolean;
}

export const Word = memo(
  forwardRef<HTMLDivElement, WordProps>(function Word(
    { letters, letterRef, error, ...settings },
    ref,
  ) {
    const lastTypedIndex = useMemo(() => {
      let index = 0;
      for (let i = 0; i < letters.length; i++) {
        if (letters[i].typed !== undefined) {
          index = i + 1;
        } else {
          return index;
        }
      }
    }, [letters]);

    return (
      <div
        className={twJoin(
          'm-[.25em] flex border-b-2',
          !settings.blindMode && error ? 'border-colorful-error' : 'border-transparent',
        )}
        ref={ref}
      >
        {letters.map((letter, index) => (
          <Letter
            key={`${letter.original}-${index}`}
            ref={ref !== null && lastTypedIndex === index ? letterRef : null}
            {...letter}
            {...settings}
          />
        ))}
      </div>
    );
  }),
);
