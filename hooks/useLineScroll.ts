import { useSettings } from '@/context/settingsContext';
import { useEffect, useRef } from 'react';

export function useLineScroll(wrapperHeight: number, currentWord?: HTMLDivElement) {
  const { smoothLineScroll, fontSize } = useSettings();
  const wordsetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    wordsetRef.current?.scroll({
      behavior: smoothLineScroll ? 'smooth' : 'auto',
      top: (currentWord?.offsetTop ?? 0) - fontSize * 4 - wrapperHeight / 3,
    });
  }, [currentWord, fontSize, smoothLineScroll, wrapperHeight]);

  return { wordsetRef };
}
