'use client';

import { languageOptions } from '@/queries/get-language';
import {
  type Language,
  type Word,
  accuracy,
  calculateCharStats,
  consistency,
} from '@/utils/typingTest';
import { useDidUpdate, useTimeout } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { type ReactNode, createContext, useContext, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { RiAlertFill } from 'react-icons/ri';
import { type Updater, useImmer } from 'use-immer';
import { useGlobal } from './globalContext';
import { useSettings } from './settingsContext';
import { useUser } from './userContext';

export interface TypingTestValues {
  words: Word[];
  wordIndex: number;
  inputValue: string;
  lastCharacter: string;
  stats: {
    raw: number;
    wpm: number;
    characters: number;
    errors: number;
  };
  chartData: {
    raw: number[];
    wpm: number[];
    errors: number[];
  };
  timer: number;
  startTime: number;
  elapsedTime: number;
  isTestRunning: boolean;
  isTestFinished: boolean;
  isPb: boolean;
}

interface TypingTestContext extends TypingTestValues {
  language?: Language;
  setValues: Updater<TypingTestValues>;
  finishTest: () => void;
}

export const TypingTestContext = createContext<TypingTestContext | null>(null);

export const initialTypingTestValues: TypingTestValues = {
  words: [],
  wordIndex: 0,
  inputValue: ' ',
  lastCharacter: ' ',
  stats: { raw: 0, wpm: 0, characters: 0, errors: 0 },
  chartData: { raw: [], wpm: [], errors: [] },
  timer: 0,
  startTime: 0,
  elapsedTime: 0,
  isTestRunning: false,
  isTestFinished: false,
  isPb: false,
};

export function TypingTestProvider({ children }: { children: ReactNode }) {
  const { testId, isUserTyping, setGlobalValues, restartTest } = useGlobal();
  const { settingsReference, ...settings } = useSettings();
  const {
    mode,
    time,
    words: wordAmount,
    blindMode,
    language: languageName,
    stopOnError,
    lazyMode,
    setSettings,
  } = settings;
  const { incrementStats, insertTest } = useUser();
  const [values, setValues] = useImmer(initialTypingTestValues);
  const { words, stats, chartData, elapsedTime, isTestRunning, isTestFinished } = values;
  const { raw, wpm, characters, errors } = stats;
  const { data: language } = useQuery(languageOptions(languageName));
  const { start: startAFK, clear: clearAFK } = useTimeout(() => {
    restartTest();
    toast.error('Test failed: You were AFK for too long!');
  }, 3000);
  const startTime = useRef(0);
  const isValidTest = settings[mode] >= settingsReference[mode].options[0].value;

  const finishTest = () => {
    setValues((draft) => {
      draft.isTestRunning = false;
      draft.isTestFinished = true;
    });
    setGlobalValues({ isUserTyping: false });
  };

  useEffect(() => {
    if (language?.rightToLeft) {
      setSettings({ language: 'english' });
      toast('Right-to-left languages are not supported yet.', { icon: <RiAlertFill /> });
    }
  }, [language, setSettings]);
  useEffect(() => {
    if (lazyMode && language?.noLazyMode) {
      setSettings({ lazyMode: false });
      toast('This language does not support lazy mode.', { icon: <RiAlertFill /> });
    }
  }, [lazyMode, language, setSettings]);
  useDidUpdate(() => {
    if (isTestRunning) {
      if (isUserTyping) clearAFK();
      else startAFK();
    }
  }, [isTestRunning, isUserTyping]);
  useDidUpdate(() => {
    let toastId: string | undefined;
    if (!isValidTest)
      toastId = toast(
        `Low custom ${mode === 'time' ? 'duration' : 'word amount'}, tests won't be saved.`,
        { icon: <RiAlertFill />, duration: Number.POSITIVE_INFINITY },
      );
    return () => toast.dismiss(toastId);
  }, [isValidTest]);
  useDidUpdate(() => {
    if (language) restartTest();
  }, [mode, time, wordAmount, blindMode, languageName, stopOnError, lazyMode]);
  useDidUpdate(() => {
    setValues((draft) => {
      draft.isTestRunning = false;
    });
  }, [testId]);
  useDidUpdate(() => {
    if (!isTestFinished) {
      if (isTestRunning) startTime.current = performance.now();
      else if (startTime.current) {
        incrementStats({
          startedTests: isValidTest ? 1 : 0,
          timeTyping: (performance.now() - startTime.current) / 1000,
        });
        startTime.current = 0;
      }
    }
  }, [isTestRunning, isTestFinished]);
  useDidUpdate(() => {
    if (isTestFinished && isValidTest) {
      const charStats = Object.values(calculateCharStats(words));
      insertTest({
        mode,
        mode2: (mode === 'time' ? time : wordAmount).toString(),
        language: languageName,
        wpm,
        raw,
        accuracy: accuracy(characters, errors),
        consistency: consistency(chartData.raw),
        charStats,
        chartData,
        duration: elapsedTime,
        blindMode,
        lazyMode,
      }).then((isPb) =>
        setValues((draft) => {
          draft.isPb = !!isPb;
        }),
      );
    }
  }, [isTestFinished]);

  return (
    <TypingTestContext.Provider value={{ language, setValues, finishTest, ...values }}>
      {children}
    </TypingTestContext.Provider>
  );
}

export function useTypingTest() {
  const context = useContext(TypingTestContext);
  if (!context) throw new Error('useTypingTest must be used within a TypingTestProvider');
  return context;
}
