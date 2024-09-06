import type { TypingTestValues } from '@/context/typingTestContext';
import type { KeyParams } from '@tatsuokaniwa/swr-firestore';
import { Timestamp } from 'firebase/firestore';
import { type Settings, type Time, type Words, settingsList } from './settings';
import type { Social } from './socials';

export interface TypingTest extends Pick<TypingTestValues, 'words' | 'stats'> {
  id: string;
  language: string;
  date: Date;
  mode: Settings['mode'];
  mode2: number;
  result: Pick<TypingTestValues['currentStats'], 'raw' | 'wpm'> & {
    accuracy: number;
    consistency: number;
    characterStats: {
      correct: number;
      incorrect: number;
      extra: number;
      missed: number;
    };
  };
  blindMode: boolean;
  lazyMode: boolean;
  isPb: boolean;
  duration: number;
}

export interface PersonalBest {
  wpm: number;
  raw: number;
  accuracy: number;
  consistency: number;
  date: Timestamp;
}

export interface User {
  id: string;
  name: string;
  joinedAt: Date;
  nameLastChangedAt?: Date | null;
  testsLastUpdatedAt?: Date | null;
  profilePicture?: {
    url: string;
    shape: 'rect' | 'round';
  };
  bannerURL?: string;
  bio: string;
  keyboard?: string;
  socials?: {
    [Key in Social]?: string;
  } & { website?: string };
  typingStats: {
    startedTests: number;
    completedTests: number;
    timeTyping: number;
    highest: { wpm: number; raw: number; accuracy: number; consistency: number };
    average: { wpm: number; raw: number; accuracy: number; consistency: number };
  };
  personalBests?: {
    time?: { [Key in Time]?: PersonalBest };
    words?: { [Key in Words]?: PersonalBest };
  };
}

export const defaultUserDetails: Partial<User> = {
  bio: 'Mastering the art of typing with Apetype!',
  typingStats: {
    startedTests: 0,
    completedTests: 0,
    timeTyping: 0,
    highest: { wpm: 0, raw: 0, accuracy: 0, consistency: 0 },
    average: { wpm: 0, raw: 0, accuracy: 0, consistency: 0 },
  },
};

export const parseDates: KeyParams<User>['parseDates'] = [
  'joinedAt',
  'nameLastChangedAt',
  'testsLastUpdatedAt',
];

export function getPersonalBest(
  user: User,
  mode: Settings['mode'],
  mode2: number,
  otherTests?: Optional<TypingTest, 'id'>[],
) {
  const currentPersonalBest = user.personalBests?.[mode]?.[
    mode2 as keyof Required<User>['personalBests'][typeof mode]
  ] as PersonalBest | undefined;
  if (otherTests && otherTests.length > 0) {
    const filteredTests = otherTests.filter((test) => test.mode === mode && test.mode2 === mode2);
    if (!filteredTests.length) return currentPersonalBest;
    const highestWpmTest = filteredTests.reduce((prev, current) =>
      prev.result.wpm > current.result.wpm ? prev : current,
    );
    const {
      date,
      result: { wpm, raw, accuracy, consistency },
    } = highestWpmTest;
    return !currentPersonalBest || highestWpmTest.result.wpm > currentPersonalBest.wpm
      ? { wpm, raw, accuracy, consistency, date: Timestamp.fromDate(date) }
      : currentPersonalBest;
  }
  return currentPersonalBest;
}

export function isPersonalBest(
  user: User,
  test: Optional<TypingTest, 'id'>,
  otherTests?: Optional<TypingTest, 'id'>[],
) {
  const personalBest = getPersonalBest(user, test.mode, test.mode2, otherTests);
  return (
    !personalBest ||
    (settingsList[test.mode].options.map(({ value }) => value).includes(test.mode2) &&
      test.result.wpm > personalBest.wpm)
  );
}
