'use client';

import { flatto } from '@alizeait/flatto';
import { useLocalStorage } from '@mantine/hooks';
import { KeyParams, useDoc } from '@tatsuokaniwa/swr-firestore';
import dayjs from 'dayjs';
import { UpdateData } from 'firebase/firestore';
import { produce } from 'immer';
import { ReactNode, createContext, useCallback, useContext, useEffect } from 'react';
import SuperJSON from 'superjson';
import { useSWRConfig } from 'swr';
import { Updater } from 'use-immer';
import { getFirebaseAuth, getFirebaseFirestore } from 'utils/firebase';
import { TypingTest, User, isPersonalBest, parseDates } from 'utils/user';
import { useAuth } from './authContext';

interface PendingData {
  tests: Omit<TypingTest, 'id'>[];
  typingStats: Omit<User['typingStats'], 'average'> & {
    accumulated: {
      wpm: number;
      raw: number;
      accuracy: number;
      consistency: number;
    };
  };
}

export interface UserContext {
  user?: User;
  updateUser: (data: UpdateData<Omit<User, 'id' | 'joinedAt'>>) => Promise<void>;
  pendingData: PendingData;
  setPendingData: Updater<PendingData>;
  removePendingData: () => void;
  savePendingData: () => Promise<void>;
}

export const UserContext = createContext<UserContext | null>(null);

const defaultPendingData: PendingData = {
  tests: [],
  typingStats: {
    startedTests: 0,
    completedTests: 0,
    timeTyping: 0,
    highest: { wpm: 0, raw: 0, accuracy: 0, consistency: 0 },
    accumulated: { wpm: 0, raw: 0, accuracy: 0, consistency: 0 },
  },
};

export function UserProvider({ children }: { children: ReactNode }) {
  const { mutate } = useSWRConfig();
  const { currentUser } = useAuth();
  const { data: user } = useDoc<User>(
    currentUser ? { path: `users/${currentUser.uid}`, parseDates } : null,
    { keepPreviousData: false },
  );
  const [pendingData, _setPendingData, removePendingData] = useLocalStorage<PendingData>({
    key: 'pendingData',
    defaultValue: defaultPendingData,
    serialize: SuperJSON.stringify,
    deserialize: (str) => (str === undefined ? defaultPendingData : SuperJSON.parse(str)),
  });
  const [testsLastUpdatedAt, setTestsLastUpdatedAt] = useLocalStorage<Date | undefined>({
    key: 'testsLastUpdatedAt',
  });

  const updateUser: UserContext['updateUser'] = useCallback(
    async (data) => {
      const [{ updateProfile }, { updateDocument }] = await Promise.all([
        getFirebaseAuth(),
        getFirebaseFirestore(),
      ]);
      if (!currentUser || !user) return;
      if (data.name !== user.name)
        await updateProfile(currentUser, { displayName: data.name as string });
      return await updateDocument<User>('users', currentUser.uid, data);
    },
    [currentUser, user],
  );
  const setPendingData: UserContext['setPendingData'] = useCallback(
    (draft) =>
      _setPendingData((prevState) =>
        typeof draft === 'function' ? produce(prevState, draft) : prevState,
      ),
    [_setPendingData],
  );
  const savePendingData = useCallback(async () => {
    if (!currentUser || !localStorage.getItem('pendingData')) return;
    const { collection, db, doc, increment, runTransaction } = await getFirebaseFirestore();
    const incrementalKeys = ['startedTests', 'completedTests', 'timeTyping'];
    const { tests, ...data } = pendingData;
    const userRef = doc(db, 'users', currentUser.uid);
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) throw 'User not found';
      const user = userDoc.data() as User;
      const newData: UpdateData<User> = {};
      const flattenedData: Record<string, number> = flatto(data);
      Object.entries(flattenedData).forEach(([_key, value]) => {
        const key = _key as keyof UpdateData<Pick<User, 'typingStats'>>;
        if (incrementalKeys.some((k) => key.includes(k))) newData[key] = increment(value);
        else if (key.includes('highest')) {
          const lastKey = key.split('.').at(-1) as keyof User['typingStats']['highest'];
          if (user.typingStats.highest[lastKey] < value) newData[key] = value;
        } else if (key.includes('accumulated')) {
          const lastKey = key.split('.').at(-1) as keyof User['typingStats']['average'];
          const { completedTests } = user.typingStats;
          const oldAverage = user.typingStats.average[lastKey] * completedTests;
          newData[`typingStats.average.${lastKey}`] =
            (oldAverage + value) / (completedTests + data.typingStats.completedTests);
        } else newData[key] = value;
      });
      if (tests.length > 0) {
        tests.forEach((test) => {
          const isPb = test.isPb || isPersonalBest(user, test, tests);
          if (isPb) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { characterStats, ...stats } = test.result;
            newData[`personalBests.${test.mode}`] = {
              ...user.personalBests?.[test.mode],
              [test.mode2]: { ...stats, date: new Date() },
            };
          }
          transaction.set(doc(collection(userRef, 'tests')), { ...test, isPb });
        });
      }
      newData.testsLastUpdatedAt = new Date();
      transaction.update(userRef, newData);
    });
    removePendingData();
  }, [currentUser, pendingData, removePendingData]);

  useEffect(() => {
    if (
      user &&
      (!testsLastUpdatedAt || dayjs(user.testsLastUpdatedAt).isAfter(testsLastUpdatedAt))
    ) {
      void mutate(
        (key: string | KeyParams<unknown>) =>
          typeof key !== 'string' && key.path === `users/${user.id}/tests`,
        undefined,
      );
      if (user.testsLastUpdatedAt) setTestsLastUpdatedAt(user.testsLastUpdatedAt);
    }
  }, [mutate, setTestsLastUpdatedAt, testsLastUpdatedAt, user]);

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
