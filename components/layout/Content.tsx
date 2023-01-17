'use client';

import { useLocalStorage, useWindowEvent } from '@mantine/hooks';
import { GlobalProvider, GlobalValues } from 'context/globalContext';
import { SettingsProvider } from 'context/settingsContext';
import { AnimatePresence } from 'framer-motion';
import { useLanguage } from 'hooks/useLanguage';
import produce, { freeze } from 'immer';
import { ReactNode, useCallback } from 'react';
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
    modalOpen: false,
  });
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
    });
  }, [setGlobalValues]);

  useWindowEvent('keydown', (event) => {
    setGlobalValues((draft) => void (draft.capsLock = event.getModifierState('CapsLock')));
  });

  return (
    <GlobalProvider
      setGlobalValues={setGlobalValues}
      restartTest={restartTest}
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
      </SettingsProvider>
    </GlobalProvider>
  );
}
