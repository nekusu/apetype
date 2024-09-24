'use client';

import { Transition } from '@/components/core/Transition';
import { useGlobal } from '@/context/globalContext';
import { useSettings } from '@/context/settingsContext';
import { useTypingTest } from '@/context/typingTestContext';
import { useCaretPosition } from '@/hooks/useCaretPosition';
import { useDidMount } from '@/hooks/useDidMount';
import { useLineScroll } from '@/hooks/useLineScroll';
import { useWords } from '@/hooks/useWords';
import { getHotkeyHandler, useDidUpdate, useTimeout, useWindowEvent } from '@mantine/hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RiCursorFill } from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';
import { Caret } from './Caret';
import { Word } from './Word';

export function Words() {
  const { modalOpened, setGlobalValues } = useGlobal();
  const {
    mode,
    time,
    words: wordAmount,
    blindMode,
    indicateTypos,
    hideExtraLetters,
    caretStyle,
    flipTestColors,
    colorfulMode,
    fontSize,
    outOfFocusWarning,
  } = useSettings();
  const { words, wordIndex, inputValue, isTestRunning, isTestFinished, setValues, finishTest } =
    useTypingTest();
  const wordsCollection = useWords();
  const { wordRef, letterRef, caretPosition } = useCaretPosition();
  const wrapperHeight = useMemo(() => fontSize * 26 * 3, [fontSize]);
  const { wordsetRef } = useLineScroll(wrapperHeight, wordRef.current);
  const [isFocused, setIsFocused] = useState(false);
  const [isBlurred, setIsBlurred] = useState(modalOpened);
  const { start: startBlur, clear: clearBlur } = useTimeout(() => setIsBlurred(true), 1000);
  const { start: startIdle, clear: clearIdle } = useTimeout(
    () => setGlobalValues({ isUserTyping: false }),
    1000,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const highestWordIndex = useRef(0);

  const focusWords = useCallback(() => {
    clearBlur();
    setIsFocused(true);
    setIsBlurred(false);
    inputRef.current?.focus();
  }, [clearBlur]);
  const blurWords = () => {
    clearBlur();
    startBlur();
    setIsFocused(false);
  };
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isTestFinished) return;
    const { value } = event.target;
    if (!isTestRunning)
      setValues((draft) => {
        draft.isTestRunning = true;
      });
    wordsCollection.update(value);
    setGlobalValues({ isUserTyping: true });
    clearIdle();
    startIdle();
  };

  useDidMount(() => {
    wordsCollection.add(mode === 'words' && wordAmount ? wordAmount : 100);
  });
  useEffect(() => {
    if (!modalOpened) focusWords();
  }, [focusWords, modalOpened]);
  useDidUpdate(() => {
    if (wordIndex > highestWordIndex.current) {
      if (mode === 'time' || words.length < (wordAmount || Number.POSITIVE_INFINITY))
        wordsCollection.add(1);
      highestWordIndex.current = wordIndex;
    }
  }, [wordIndex]);
  useWindowEvent('keyup', (event) => {
    if (!(modalOpened || isFocused || ['Tab', 'Escape'].includes(event.key))) {
      event.preventDefault();
      focusWords();
    }
  });

  return (
    <div
      className='relative leading-none'
      style={{ height: wrapperHeight, fontSize: `${fontSize}rem` }}
      onClick={focusWords}
    >
      <input
        className='-z-10 absolute opacity-0'
        autoCapitalize='off'
        onBlur={blurWords}
        onChange={handleInput}
        onFocus={(e) => {
          // Set caret position to the end of the input value
          const value = e.target.value;
          e.target.value = '';
          e.target.value = value;
          focusWords();
        }}
        onKeyDown={getHotkeyHandler([
          [
            ((mode === 'time' && !time) || (mode === 'words' && !wordAmount)) && isTestRunning
              ? 'shift+Enter'
              : '',
            finishTest,
          ],
        ])}
        ref={inputRef}
        value={inputValue}
      />
      <div
        className={twJoin(
          'relative mx-[-.25em] flex max-h-full flex-wrap overflow-hidden transition duration-200',
          outOfFocusWarning && isBlurred && 'opacity-40 blur',
        )}
        ref={wordsetRef}
      >
        {isFocused && caretStyle && (
          <Caret width={letterRef.current?.offsetWidth} {...caretPosition} />
        )}
        {words.map(({ isCorrect, letters }, index) => (
          <Word
            key={`${letters[0].original}-${index}`}
            ref={wordIndex === index ? wordRef : null}
            letters={letters}
            letterRef={letterRef}
            error={wordIndex > index && !isCorrect}
            blindMode={blindMode}
            indicateTypos={indicateTypos}
            hideExtraLetters={hideExtraLetters}
            flipTestColors={flipTestColors}
            colorfulMode={colorfulMode}
          />
        ))}
      </div>
      {outOfFocusWarning && isBlurred && (
        <Transition className='absolute inset-0 flex cursor-pointer items-center justify-center gap-1.5 text-base text-text transition-colors'>
          <RiCursorFill />
          Click or press any key to focus
        </Transition>
      )}
    </div>
  );
}
