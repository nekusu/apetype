'use client';

import { useDisclosure, useLocalStorage, useWindowEvent } from '@mantine/hooks';
import { CommandLine } from 'components/command-line';
import { GlobalContext, GlobalProvider, GlobalValues } from 'context/globalContext';
import { SettingsContext, SettingsProvider } from 'context/settingsContext';
import { AnimatePresence } from 'framer-motion';
import { useDidMount } from 'hooks/useDidMount';
import { useLanguage } from 'hooks/useLanguage';
import { useTheme } from 'hooks/useTheme';
import produce, { freeze } from 'immer';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { DraftFunction, useImmer } from 'use-immer';
import {
  defaultSettings,
  SettingId,
  Settings,
  ThemeInfo,
  updateSettingsList,
} from 'utils/settings';
import { Footer, Header } from '.';

interface ContentProps {
  children: ReactNode;
  languages: string[];
  themes: ThemeInfo[];
}

export default function Content({ children, languages, themes }: ContentProps) {
  const [globalValues, setGlobalValues] = useImmer<GlobalValues>({
    themes: themes.reduce((themes, { name, ...rest }) => {
      themes[name] = rest;
      return themes;
    }, {} as GlobalContext['themes']),
    capsLock: false,
    isUserTyping: false,
    isTestFinished: false,
    modalOpen: false,
  });
  const [commandLineOpen, _commandLineHandler] = useDisclosure(false);
  const [settingId, setSettingId] = useState<SettingId>();
  const [settings, _setSettings] = useLocalStorage<Settings>({
    key: 'settings',
    defaultValue: freeze(defaultSettings),
  });
  const setSettings: SettingsContext['setSettings'] = useCallback(
    (updater: Settings | DraftFunction<Settings>) => {
      if (typeof updater === 'function') _setSettings(produce(updater));
      else _setSettings(freeze(updater));
    },
    [_setSettings]
  );
  const { language } = useLanguage(settings.language);
  const { isLoading } = useTheme(settings.theme);

  const restartTest = useCallback(() => {
    setGlobalValues((draft) => {
      draft.testId = crypto.randomUUID();
      draft.isUserTyping = false;
      draft.isTestFinished = false;
    });
  }, [setGlobalValues]);
  const commandLineHandler: GlobalContext['commandLineHandler'] = useMemo(
    () => ({
      open: (settingId) => {
        setGlobalValues((draft) => void (draft.modalOpen = true));
        setSettingId(settingId);
        _commandLineHandler.open();
      },
      close: () => {
        setGlobalValues((draft) => void (draft.modalOpen = false));
        setSettingId(undefined);
        _commandLineHandler.close();
      },
      toggle: () => {
        setGlobalValues((draft) => void (draft.modalOpen = !draft.modalOpen));
        if (commandLineOpen) setSettingId(undefined);
        _commandLineHandler.toggle();
      },
    }),
    [_commandLineHandler, commandLineOpen, setGlobalValues]
  );

  useDidMount(() => {
    _setSettings((currentSettings) => ({ ...defaultSettings, ...currentSettings }));
    updateSettingsList((draft) => {
      draft.language.options = languages.map((language) => ({ value: language }));
      draft.theme.options = themes.map(({ name }) => ({ value: name }));
    });
  });
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
      language={language}
      isThemeLoading={isLoading}
      setGlobalValues={setGlobalValues}
      commandLineHandler={commandLineHandler}
      restartTest={restartTest}
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
          settingId={settingId}
        />
      </SettingsProvider>
    </GlobalProvider>
  );
}
