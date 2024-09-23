'use client';

import { useThrottle } from '@/hooks/useThrottle';
import type { Settings } from '@/utils/settings';
import { useDidUpdate, useSetState, useWindowEvent } from '@mantine/hooks';
import { LazyMotion } from 'framer-motion';
import { type ReactNode, createContext, useContext, useMemo } from 'react';

export interface GlobalValues {
  testId?: string;
  capsLock: boolean;
  isUserTyping: boolean;
  modalOpened: boolean;
  commandLine: {
    opened: boolean;
    initialSetting?: keyof Settings;
  };
}

export interface GlobalContext extends GlobalValues {
  setGlobalValues: (
    statePartial: Partial<GlobalValues> | ((currentState: GlobalValues) => Partial<GlobalValues>),
  ) => void;
  commandLine: GlobalValues['commandLine'] & {
    handler: {
      open: (initialSetting?: keyof Settings) => void;
      close: () => void;
    };
  };
  restartTest: () => void;
}

export const GlobalContext = createContext<GlobalContext | null>(null);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [globalValues, setGlobalValues] = useSetState<GlobalValues>({
    capsLock: false,
    isUserTyping: false,
    modalOpened: false,
    commandLine: { opened: false },
  });

  const restartTest = useThrottle(() => {
    const newTestId = crypto.randomUUID();
    setGlobalValues({ testId: newTestId, isUserTyping: false });
  }, 500);
  const handler: GlobalContext['commandLine']['handler'] = useMemo(
    () => ({
      open: (initialSetting) =>
        setGlobalValues({
          modalOpened: true,
          commandLine: { opened: true, initialSetting: initialSetting },
        }),
      close: () =>
        setGlobalValues({
          modalOpened: false,
          commandLine: { opened: false, initialSetting: undefined },
        }),
    }),
    [setGlobalValues],
  );

  useDidUpdate(() => {
    if (globalValues.isUserTyping) document.body.requestPointerLock();
    else document.exitPointerLock();
  }, [globalValues.isUserTyping]);
  useWindowEvent('keydown', (event) => {
    setGlobalValues({ capsLock: event.getModifierState('CapsLock') });
  });

  return (
    <GlobalContext.Provider
      value={{
        ...globalValues,
        setGlobalValues,
        commandLine: { ...globalValues.commandLine, handler },
        restartTest,
      }}
    >
      <LazyMotion features={async () => (await import('framer-motion')).domMax} strict>
        {children}
      </LazyMotion>
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);
  if (!context) throw new Error('useGlobal must be used within a GlobalProvider');
  return context;
}
