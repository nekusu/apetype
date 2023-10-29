'use client';

import { Unsubscribe, User } from 'firebase/auth';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { getFirebaseAuth } from 'utils/firebase';

export interface AuthContext {
  signedIn: boolean;
  currentUser: User | null;
}

export const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    let unsuscribe: Unsubscribe | null = null;
    void (async () => {
      const { auth, onAuthStateChanged } = await getFirebaseAuth();
      unsuscribe = onAuthStateChanged(auth, (user) => {
        setSignedIn(!!user);
        setCurrentUser(user);
      });
    })();
    return () => unsuscribe?.();
  }, []);

  return <AuthContext.Provider value={{ signedIn, currentUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
