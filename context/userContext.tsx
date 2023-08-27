'use client';

import { useDoc } from '@tatsuokaniwa/swr-firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { auth, updateDocument } from 'utils/firebase';

export interface User {
  id: string;
  name: string;
  joinedAt: Date;
}

export interface UserContext {
  user?: User;
  updateUser: (user: Partial<Omit<User, 'id' | 'joinedAt'>>) => Promise<void>;
}

export const UserContext = createContext<UserContext | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string>();
  const { data: user } = useDoc<User>(
    userId ? { path: `users/${userId}`, parseDates: ['joinedAt'] } : null,
  );

  const updateUser: UserContext['updateUser'] = useCallback(
    async (user) => {
      if (!auth.currentUser || !userId) return;
      if (user.name) {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(auth.currentUser, { displayName: user.name });
      }
      return await updateDocument('users', userId, user);
    },
    [userId],
  );

  useEffect(() => {
    const unsuscribe = onAuthStateChanged(auth, (user) => setUserId(user?.uid));
    return () => unsuscribe();
  }, []);

  return <UserContext.Provider value={{ user, updateUser }}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
}
