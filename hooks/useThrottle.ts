import { useCallback, useEffect, useRef } from 'react';

interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

// biome-ignore lint/suspicious/noExplicitAny: this is intentional
export function useThrottle<T extends (...args: any[]) => any>(
  cb: T,
  delay: number,
  options?: ThrottleOptions,
) {
  const { leading = true, trailing = true } = options ?? {};
  const cbRef = useRef(cb);
  const timerId = useRef<NodeJS.Timeout | null>(null);
  const lastArgs = useRef<Parameters<T> | null>(null);

  useEffect(() => {
    cbRef.current = cb;
  }, [cb]);

  return useCallback(
    // biome-ignore lint/suspicious/noExplicitAny: this is intentional
    function (this: any, ...args: Parameters<T>) {
      const waitFunc = () => {
        if (trailing && lastArgs.current) {
          cbRef.current.apply(this, lastArgs.current);
          lastArgs.current = null;
          timerId.current = setTimeout(waitFunc, delay);
        } else timerId.current = null;
      };

      if (!timerId.current && leading) cbRef.current.apply(this, args);
      else lastArgs.current = args;

      if (!timerId.current) timerId.current = setTimeout(waitFunc, delay);
    },
    [delay, leading, trailing],
  );
}
