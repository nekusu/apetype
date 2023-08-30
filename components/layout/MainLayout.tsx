'use client';

import { Toast } from 'components/core';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { RiCheckboxCircleFill, RiErrorWarningFill, RiLoaderLine } from 'react-icons/ri';
import { Footer, Header } from '.';

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
      <Toaster
        containerClassName='!inset-6'
        position='top-right'
        gutter={12}
        toastOptions={{
          error: { icon: <RiErrorWarningFill /> },
          success: { duration: 4000, icon: <RiCheckboxCircleFill /> },
          loading: { icon: <RiLoaderLine className='animate-spin' /> },
        }}
      >
        {(t) => <Toast t={t} />}
      </Toaster>
    </div>
  );
}
