'use client';

import { useThrottle } from '@/hooks/useThrottle';
import { settingsList } from '@/utils/settings';
import type { ThemeInfo } from '@/utils/theme';
import type { KeymapLayout } from '@/utils/typingTest';
import { LazyMotion } from 'framer-motion';
import { nanoid } from 'nanoid/non-secure';
import { type ReactNode, createContext, useContext, useMemo } from 'react';
import { type Updater, useImmer } from 'use-immer';

export interface GlobalValues {
  testId?: string;
  capsLock: boolean;
  isUserTyping: boolean;
  isTestFinished: boolean;
  modalOpened: boolean;
  keymapLayouts: Record<string, KeymapLayout>;
  settingsList: typeof settingsList;
  commandLine: {
    opened: boolean;
    initialSetting?: keyof typeof settingsList;
  };
}

export interface GlobalContext extends GlobalValues {
  setGlobalValues: Updater<GlobalValues>;
  restartTest: () => void;
  commandLine: GlobalValues['commandLine'] & {
    handler: {
      open: (initialSetting?: keyof typeof settingsList) => void;
      close: () => void;
    };
  };
}

interface GlobalProviderProps {
  children: ReactNode;
  layouts: Record<string, KeymapLayout>;
  languages: string[];
  themes: ThemeInfo[];
}

export const GlobalContext = createContext<GlobalContext | null>(null);

export function GlobalProvider({ children, languages, layouts, themes }: GlobalProviderProps) {
  const [globalValues, setGlobalValues] = useImmer<GlobalValues>({
    capsLock: false,
    isUserTyping: false,
    isTestFinished: false,
    modalOpened: false,
    keymapLayouts: layouts,
    settingsList: {
      ...settingsList,
      language: {
        ...settingsList.language,
        options: languages.map((language) => ({ value: language })),
      },
      keymapLayout: {
        ...settingsList.keymapLayout,
        options: Object.keys(layouts).map((layout) => ({ value: layout.replaceAll('_', ' ') })),
      },
      theme: { ...settingsList.theme, options: themes.map(({ name }) => ({ value: name })) },
    },
    commandLine: { opened: false },
  });
  const handler: GlobalContext['commandLine']['handler'] = useMemo(
    () => ({
      open: (initialSetting) =>
        setGlobalValues((draft) => {
          draft.modalOpened = true;
          draft.commandLine.opened = true;
          draft.commandLine.initialSetting = initialSetting;
        }),
      close: () =>
        setGlobalValues((draft) => {
          draft.modalOpened = false;
          draft.commandLine.opened = false;
          draft.commandLine.initialSetting = undefined;
        }),
    }),
    [setGlobalValues],
  );
  const restartTest = useThrottle(() => {
    const newTestId = nanoid(10);
    setGlobalValues((draft) => {
      draft.testId = newTestId;
      draft.isUserTyping = false;
      draft.isTestFinished = false;
    });
  }, 500);

  return (
    <GlobalContext.Provider
      value={{
        setGlobalValues,
        restartTest,
        ...globalValues,
        commandLine: { ...globalValues.commandLine, handler },
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
