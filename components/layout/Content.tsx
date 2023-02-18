'use client';

import { useDisclosure, useLocalStorage, useWindowEvent } from '@mantine/hooks';
import { CommandLine } from 'components/command-line';
import { GlobalProvider, GlobalValues } from 'context/globalContext';
import { SettingsProvider } from 'context/settingsContext';
import { AnimatePresence } from 'framer-motion';
import { useLanguage } from 'hooks/useLanguage';
import produce, { freeze } from 'immer';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { DraftFunction, Updater, useImmer } from 'use-immer';
import { defaultSettings, Settings } from 'utils/settings';
import { Footer, Header } from '.';

interface ContentProps {
  children: ReactNode;
}

export default function Content({ children }: ContentProps) {
  const { language } = useLanguage('english');
  const [globalValues, setGlobalValues] = useImmer<GlobalValues>({
    capsLock: false,
    isUserTyping: false,
    isTestFinished: false,
    modalOpen: false,
  });
  const [defaultCommand, setDefaultCommand] = useState<string | undefined>();
  const [commandLineOpen, _commandLineHandler] = useDisclosure(false);
  const [settings, _setSettings] = useLocalStorage<Settings>({
    key: 'settings',
    defaultValue: freeze(defaultSettings),
  });
  const setSettings: Updater<Settings> = useCallback(
    (updater: Settings | DraftFunction<Settings>) => {
      if (typeof updater === 'function') _setSettings(produce(updater));
      else _setSettings(freeze(updater));
    },
    [_setSettings]
  );

  const restartTest = useCallback(() => {
    setGlobalValues((draft) => {
      draft.testId = crypto.randomUUID();
      draft.isUserTyping = false;
      draft.isTestFinished = false;
    });
  }, [setGlobalValues]);
  const commandLineHandler = useMemo(
    () => ({
      open: (command?: string) => {
        setGlobalValues((draft) => void (draft.modalOpen = true));
        setDefaultCommand(command);
        _commandLineHandler.open();
      },
      close: () => {
        setGlobalValues((draft) => void (draft.modalOpen = false));
        _commandLineHandler.close();
      },
      toggle: () => {
        setGlobalValues((draft) => void (draft.modalOpen = !draft.modalOpen));
        _commandLineHandler.toggle();
      },
    }),
    [_commandLineHandler, setGlobalValues]
  );

  useEffect(() => {
    const fontFamily = settings.fontFamily;
    document.documentElement.style.setProperty(
      '--font',
      fontFamily.startsWith('--') ? `var(${fontFamily})` : fontFamily
    );
  }, [settings.fontFamily]);
  useWindowEvent('keydown', (event) => {
    setGlobalValues((draft) => void (draft.capsLock = event.getModifierState('CapsLock')));
    if (
      event.key === (settings.quickRestart !== 'esc' ? 'Escape' : 'Tab') &&
      (!globalValues.modalOpen || commandLineOpen)
    ) {
      commandLineHandler.toggle();
    }
  });

  return (
    <GlobalProvider
      setGlobalValues={setGlobalValues}
      restartTest={restartTest}
      commandLineHandler={commandLineHandler}
      language={language}
      {...globalValues}
    >
      <SettingsProvider setSettings={setSettings} {...settings}>
        <div
          className='grid min-h-screen w-screen grid-rows-[auto_1fr_17.5px] gap-5 p-8'
          style={{ maxWidth: settings.pageWidth }}
        >
          <Header />
          {children}
          <AnimatePresence>{!globalValues.isUserTyping && <Footer />}</AnimatePresence>
        </div>
        <CommandLine
          open={commandLineOpen}
          onClose={commandLineHandler.close}
          defaultCommand={defaultCommand}
        />
      </SettingsProvider>
    </GlobalProvider>
  );
}
