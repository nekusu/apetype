import { TypingTestProvider } from '@/context/typingTestContext';
import type { ReactNode } from 'react';

export default function HomeLayout({ children }: { children: ReactNode }) {
  return <TypingTestProvider>{children}</TypingTestProvider>;
}
