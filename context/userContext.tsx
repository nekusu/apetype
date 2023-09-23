'use client';

import { useDoc } from '@tatsuokaniwa/swr-firestore';
import { Unsubscribe } from 'firebase/auth';
import { UpdateData } from 'firebase/firestore';
import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getFirebaseAuth, getFirebaseFirestore } from 'utils/firebase';

export interface User {
  id: string;
  name: string;
  joinedAt: Date;
}

export interface UserContext {
  user?: User;
  updateUser: (user: UpdateData<Omit<User, 'id' | 'joinedAt'>>) => Promise<void>;
}

export const UserContext = createContext<UserContext | null>(null);
export const defaultUserDetails: Partial<User> = {};

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string>();
  const { data: user } = useDoc<User>(
    userId ? { path: `users/${userId}`, parseDates: ['joinedAt'] } : null,
  );

  const updateUser: UserContext['updateUser'] = useCallback(
    async (user) => {
      const [{ auth, updateProfile }, { updateDocument }] = await Promise.all([
        getFirebaseAuth(),
        getFirebaseFirestore(),
      ]);
      if (!auth.currentUser || !userId) return;
      if (user.name) await updateProfile(auth.currentUser, { displayName: user.name as string });
      return await updateDocument('users', userId, user);
    },
    [userId],
  );

  useEffect(() => {
    let unsuscribe: Unsubscribe | null = null;
    void (async () => {
      const { auth, onAuthStateChanged } = await getFirebaseAuth();
      unsuscribe = onAuthStateChanged(auth, (user) => setUserId(user?.uid));
    })();
    return () => unsuscribe?.();
  }, []);

  return <UserContext.Provider value={{ user, updateUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}
