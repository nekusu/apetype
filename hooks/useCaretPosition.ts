import { useTypingTest } from '@/context/typingTestContext';
import { useEffect, useState } from 'react';
import { useStatefulRef } from './useStatefulRef';

export function useCaretPosition() {
  const { inputValue } = useTypingTest();
  const wordRef = useStatefulRef<HTMLDivElement>();
  const letterRef = useStatefulRef<HTMLSpanElement>();
  const [caretPosition, setCaretPosition] = useState({ x: 0, y: 0 });

  // biome-ignore lint/correctness/useExhaustiveDependencies: this is intentional
  useEffect(() => {
    const word = wordRef.current;
    const letter = letterRef.current;
    setCaretPosition({
      x: letter?.offsetLeft ?? (word ? word.offsetLeft + word.offsetWidth : 0),
      y: word?.offsetTop ?? 0,
    });
  }, [inputValue, letterRef.current, wordRef.current]);

  return { wordRef, letterRef, caretPosition };
}
