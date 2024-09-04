import { type MutableRefObject, useRef, useState } from 'react';

export function useStatefulRef<T>(initialValue?: T): MutableRefObject<T> {
  let [current, setCurrent] = useState<T | undefined>(initialValue);
  const { current: ref } = useRef({
    current,
  });

  Object.defineProperty(ref, 'current', {
    get: () => current as T,
    set: (value: T) => {
      if (!Object.is(current, value)) {
        current = value;
        setCurrent(value);
      }
    },
  });

  return ref as MutableRefObject<T>;
}
