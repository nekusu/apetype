'use client';

import { useAuth } from '@/context/authContext';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const { signedIn } = useAuth();
  if (signedIn) redirect('/account');
  return children;
}
