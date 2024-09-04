import { type EffectCallback, useEffect, useRef } from 'react';

// Prevents the effect from running twice when using StrictMode
export const useDidMount = (effect: EffectCallback) => {
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) effect();
    mounted.current = true;
  }, [effect]);
};
