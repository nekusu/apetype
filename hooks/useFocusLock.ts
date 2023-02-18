import { useEventListener, useMergedRef } from '@mantine/hooks';
import { useRef } from 'react';

export function useFocusLock() {
  const inputRef = useRef<HTMLInputElement>(null);
  const eventRef = useEventListener('blur', () => inputRef.current?.focus());
  const focusLockRef = useMergedRef(eventRef, inputRef);
  return focusLockRef;
}
