'use client';

import { useLocalStorage } from '@mantine/hooks';
import { useDoc } from '@tatsuokaniwa/swr-firestore';
import { Timestamp, UpdateData } from 'firebase/firestore';
import { produce } from 'immer';
import { ReactNode, createContext, useCallback, useContext } from 'react';
import { Updater } from 'use-immer';
import { getFirebaseAuth, getFirebaseFirestore } from 'utils/firebase';
import { flattenObject } from 'utils/misc';
import { Settings, Time, Words } from 'utils/settings';
import { Social } from 'utils/socials';
import { TypingTestValues } from 'utils/typingTest';
import { useAuth } from './authContext';

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
  lastUsernameChange?: Timestamp | null;
  profilePicture?: {
    url: string;
    shape: 'rect' | 'round';
  };
  bannerURL?: string;
  bio: string;
  keyboard?: string;
  socials?: {
    [key in Social]?: string;
  } & { website?: string };
  typingStats: {
    startedTests: number;
    completedTests: number;
    timeTyping: number;
    highest: { wpm: number; raw: number; accuracy: number; consistency: number };
    average: { wpm: number; raw: number; accuracy: number; consistency: number };
  };
  personalBests?: {
    time?: { [key in Time]?: PersonalBest };
    words?: { [key in Words]?: PersonalBest };
  };
}

interface PendingData {
  typingStats: User['typingStats'];
  tests: Omit<TypingTest, 'id'>[];
}

export interface UserContext {
  user?: User;
  updateUser: (user: UpdateData<Omit<User, 'id' | 'joinedAt'>>) => Promise<void>;
  pendingData: PendingData;
  setPendingData: Updater<PendingData>;
  removePendingData: () => void;
  savePendingData: () => Promise<void>;
}

export const UserContext = createContext<UserContext | null>(null);
export const defaultTypingStats: User['typingStats'] = {
  startedTests: 0,
  completedTests: 0,
  timeTyping: 0,
  highest: { wpm: 0, raw: 0, accuracy: 0, consistency: 0 },
  average: { wpm: 0, raw: 0, accuracy: 0, consistency: 0 },
};
export const defaultUserDetails: Partial<User> = {
  bio: 'Mastering the art of typing with Apetype!',
  typingStats: defaultTypingStats,
};

export function UserProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  console.log(currentUser);
  const { data: user } = useDoc<User>(
    currentUser ? { path: `users/${currentUser.uid}`, parseDates: ['joinedAt'] } : null,
    { keepPreviousData: false },
  );
  const [pendingData, _setPendingData, removePendingData] = useLocalStorage<PendingData>({
    key: 'pendingData',
    defaultValue: { typingStats: defaultTypingStats, tests: [] },
  });

  const updateUser: UserContext['updateUser'] = useCallback(
    async (user) => {
      const [{ updateProfile }, { updateDocument }] = await Promise.all([
        getFirebaseAuth(),
        getFirebaseFirestore(),
      ]);
      if (!currentUser) return;
      if (user.name) await updateProfile(currentUser, { displayName: user.name as string });
      return await updateDocument('users', currentUser.uid, user);
    },
    [currentUser],
  );
  const setPendingData: UserContext['setPendingData'] = useCallback(
    (draft) =>
      _setPendingData((prevState) =>
        typeof draft === 'function' ? produce(prevState, draft) : prevState,
      ),
    [_setPendingData],
  );
  const savePendingData = useCallback(async () => {
    if (!currentUser) return;
    const { addDocument, increment } = await getFirebaseFirestore();
    const incrementalKeys = ['startedTests', 'completedTests', 'timeTyping'];
    const { tests, typingStats } = pendingData;
    const newUserData = Object.entries(flattenObject({ typingStats })).reduce(
      (user, [_key, value]) => {
        const key = _key as keyof typeof user;
        if (value) {
          if (incrementalKeys.some((k) => key.includes(k))) user[key] = increment(value as number);
          else user[key] = value as number;
        }
        return user;
      },
      {} as UpdateData<Pick<User, 'typingStats'>>,
    );
    void updateUser(newUserData);
    tests.forEach((test) => void addDocument(`users/${currentUser.uid}/tests`, test));
    removePendingData();
  }, [pendingData, removePendingData, updateUser, currentUser]);

  return (
    <UserContext.Provider
      value={{ user, updateUser, pendingData, setPendingData, removePendingData, savePendingData }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}
