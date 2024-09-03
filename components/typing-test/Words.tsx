'use client';

import { getHotkeyHandler, useDidUpdate, useTimeout, useWindowEvent } from '@mantine/hooks';
import { Transition } from 'components/core';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { useTypingTest } from 'context/typingTestContext';
import { useCaretPosition } from 'hooks/useCaretPosition';
import { useDidMount } from 'hooks/useDidMount';
import { useLineScroll } from 'hooks/useLineScroll';
import { useWords } from 'hooks/useWords';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RiCursorFill } from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';
import { Caret, Word } from '.';

export default function Words() {
  const { isTestFinished, modalOpen, setGlobalValues } = useGlobal();
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
  const { words, wordIndex, inputValue, isTestRunning, setValues } = useTypingTest();
  const wordsCollection = useWords();
  const { wordRef, letterRef, caretPosition } = useCaretPosition();
  const wrapperHeight = useMemo(() => fontSize * 26 * 3, [fontSize]);
  const { wordsetRef } = useLineScroll(wrapperHeight, wordRef.current);
  const [isFocused, setIsFocused] = useState(false);
  const [isBlurred, setIsBlurred] = useState(modalOpen);
  const { start: startBlur, clear: clearBlur } = useTimeout(() => setIsBlurred(true), 1000);
  const { start: startIdle, clear: clearIdle } = useTimeout(
    () => setGlobalValues((draft) => void (draft.isUserTyping = false)),
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
    if (!isTestRunning) setValues((draft) => void (draft.isTestRunning = true));
    wordsCollection.update(value);
    setGlobalValues((draft) => void (draft.isUserTyping = true));
    clearIdle();
    startIdle();
  };
  const finishTest = () => {
    setValues((draft) => void (draft.isTestRunning = false));
    setGlobalValues((draft) => void (draft.isTestFinished = true));
  };

  useDidMount(() => {
    wordsCollection.add(mode === 'words' && wordAmount ? wordAmount : 100);
  });
  useEffect(() => {
    if (!modalOpen) focusWords();
  }, [focusWords, modalOpen]);
  useDidUpdate(() => {
    if (wordIndex > highestWordIndex.current) {
      if (mode === 'time' || words.length < (wordAmount || Infinity)) wordsCollection.add(1);
      highestWordIndex.current = wordIndex;
    }
  }, [wordIndex]);
  useWindowEvent('keyup', (event) => {
    if (!modalOpen && !isFocused && !['Tab', 'Escape'].includes(event.key)) {
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
        className='absolute opacity-0 -z-10'
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
        {words.map(({ original, isCorrect, letters }, index) => (
          <Word
            key={`${original}-${index}`}
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
