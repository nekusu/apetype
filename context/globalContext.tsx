'use client';

import { useThrottle } from 'hooks/useThrottle';
import { ReactNode, createContext, useContext, useMemo } from 'react';
import { Updater, useImmer } from 'use-immer';
import { settingsList } from 'utils/settings';
import { ThemeInfo } from 'utils/theme';

export interface GlobalValues {
  testId?: string;
  capsLock: boolean;
  isUserTyping: boolean;
  isTestFinished: boolean;
  modalOpen: boolean;
  settingsList: typeof settingsList;
  commandLine: {
    open: boolean;
    initialSetting?: keyof typeof settingsList;
    handler?: {
      open: (initialSetting?: keyof typeof settingsList) => void;
      close: () => void;
    };
  };
}

export interface GlobalContext extends GlobalValues {
  setGlobalValues: Updater<GlobalValues>;
  restartTest: () => void;
}

interface GlobalProviderProps {
  children: ReactNode;
  languages: string[];
  themes: ThemeInfo[];
}

export const GlobalContext = createContext<GlobalContext | null>(null);

export function GlobalProvider({ children, languages, themes }: GlobalProviderProps) {
  const [globalValues, setGlobalValues] = useImmer<GlobalValues>({
    capsLock: false,
    isUserTyping: false,
    isTestFinished: false,
    modalOpen: false,
    settingsList: {
      ...settingsList,
      language: {
        ...settingsList.language,
        options: languages.map((language) => ({ value: language })),
      },
      theme: { ...settingsList.theme, options: themes.map(({ name }) => ({ value: name })) },
    },
    commandLine: { open: false },
  });
  const handler: GlobalContext['commandLine']['handler'] = useMemo(
    () => ({
      open: (initialSetting) =>
        setGlobalValues((draft) => {
          draft.modalOpen = true;
          draft.commandLine.open = true;
          draft.commandLine.initialSetting = initialSetting;
        }),
      close: () =>
        setGlobalValues((draft) => {
          draft.modalOpen = false;
          draft.commandLine.open = false;
          draft.commandLine.initialSetting = undefined;
        }),
    }),
    [setGlobalValues]
  );
  const restartTest = useThrottle(() => {
    console.log('restart');
    setGlobalValues((draft) => {
      draft.testId = crypto.randomUUID();
      draft.isUserTyping = false;
      draft.isTestFinished = false;
    });
  }, 250);

  return (
    <GlobalContext.Provider
      value={{
        setGlobalValues,
        restartTest,
        ...globalValues,
        commandLine: { ...globalValues.commandLine, handler },
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() {
  const context = useContext(GlobalContext);

  if (!context) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }

  return context;
}
