'use client';

import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import Footer from './Footer';
import Header from './Header';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { isUserTyping } = useGlobal();
  const { pageWidth } = useSettings();

  return (
    <div
      className='grid grid-rows-[auto_1fr_17.5px] min-h-screen w-screen gap-5 p-8'
      style={{ maxWidth: pageWidth }}
    >
      <Header />
      {children}
      <AnimatePresence>{!isUserTyping && <Footer />}</AnimatePresence>
    </div>
  );
}
