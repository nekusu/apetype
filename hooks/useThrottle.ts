/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useRef } from 'react';

interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  wait: number,
  options: ThrottleOptions = { leading: true, trailing: true }
): (...args: Parameters<T>) => void {
  const timerId = useRef<NodeJS.Timeout | null>(null);
  const lastArgs = useRef<Parameters<T> | null>(null);

  const throttle = useCallback(
    function (this: any, ...args: Parameters<T>) {
      const { trailing, leading } = options;
      const waitFunc = () => {
        if (trailing && lastArgs.current) {
          fn.apply(this, lastArgs.current);
          lastArgs.current = null;
          timerId.current = setTimeout(waitFunc, wait);
        } else {
          timerId.current = null;
        }
      };

      if (!timerId.current && leading) {
        fn.apply(this, args);
      } else {
        lastArgs.current = args;
      }

      if (!timerId.current) {
        timerId.current = setTimeout(waitFunc, wait);
      }
    },
    [fn, wait, options]
  );

  return throttle;
}
