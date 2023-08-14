'use client';

import { useDidUpdate, useLocalStorage } from '@mantine/hooks';
import { Button, Toast } from 'components/core';
import { useGlobal } from 'context/globalContext';
import { useSettings } from 'context/settingsContext';
import { AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { RiCheckboxCircleFill, RiErrorWarningFill, RiLoaderLine } from 'react-icons/ri';
import { version } from 'utils/version';
import Footer from './Footer';
import Header from './Header';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { isUserTyping } = useGlobal();
  const { pageWidth } = useSettings();
  const [lastVersion, setLastVersion] = useLocalStorage({ key: 'lastVersion' });

  useDidUpdate(() => {
    if (lastVersion && lastVersion !== version)
      toast(
        (t) => (
          <div className='flex flex-col gap-2'>
            New version {version}!
            <div className='flex gap-2'>
              <Button className='w-full' variant='subtle' onClick={() => toast.dismiss(t.id)}>
                dismiss
              </Button>
              <Button asChild active className='w-full' variant='filled'>
                <a
                  href={`https://github.com/nekusu/apetype/releases/tag/v${version}`}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  see changelog
                </a>
              </Button>
            </div>
          </div>
        ),
        { duration: Infinity },
      );
    setLastVersion(version);
  }, [lastVersion]);

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
