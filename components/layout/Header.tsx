'use client';

import { Button, Text, Tooltip, Transition } from 'components/core';
import { useGlobal } from 'context/globalContext';
import { AnimatePresence, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  RiInformationFill,
  RiKeyboardBoxFill,
  RiSettingsFill,
  RiVipCrownFill,
} from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';
import LogoIcon from './LogoIcon';

const BUTTONS = [
  { label: 'Home', href: '/', icon: <RiKeyboardBoxFill /> },
  { label: 'Leaderboards', href: '/leaderboards', icon: <RiVipCrownFill /> },
  { label: 'About', href: '/about', icon: <RiInformationFill /> },
  { label: 'Settings', href: '/settings', icon: <RiSettingsFill /> },
];

export default function Header() {
  const { testId, isUserTyping, restartTest } = useGlobal();
  const router = useRouter();
  const pathname = usePathname();
  const animationControls = useAnimation();

  useEffect(() => {
    if (!isUserTyping)
      void animationControls.start({
        pathOffset: [0, 1, 2],
        transition: { duration: 1 },
      });
  }, [isUserTyping, animationControls, testId]);

  return (
    <div className='relative z-10 grid grid-cols-[auto_1fr_auto] w-full select-none gap-3'>
      <div
        className='flex items-center gap-2 font-[var(--font-lexend-deca)] transition-transform active:translate-y-0.5'
        onClick={() => {
          if (pathname === '/') restartTest();
          else router.push('/');
        }}
      >
        <LogoIcon
          className={twJoin(['animate-fade-in', isUserTyping ? 'stroke-sub' : 'stroke-main'])}
          controls={animationControls}
        />
        <Transition transition={{ duration: 0.75 }}>
          <Text className='relative mb-[7px] text-[32px] leading-none' dimmed={isUserTyping}>
            <AnimatePresence>
              {!isUserTyping && (
                <Transition
                  className='absolute left-3 top-[-3px]'
                  variants={{
                    initial: { opacity: 0, x: -30 },
                    animate: {
                      opacity: 1,
                      x: 0,
                      transition: {
                        delay: 0.75,
                        duration: 0.75,
                        type: 'spring',
                        stiffness: 30,
                        damping: 10,
                      },
                    },
                    exit: { opacity: 0 },
                  }}
                >
                  <Text className='text-[10px] leading-none' dimmed>
                    ape see
                  </Text>
                </Transition>
              )}
            </AnimatePresence>
            apetype
          </Text>
        </Transition>
      </div>
      <AnimatePresence>
        {!isUserTyping && (
          <Transition
            className='flex items-center gap-1.5'
            variants={{
              initial: { opacity: 0 },
              animate: { opacity: 1, transition: { delay: 0.25, duration: 0.5 } },
              exit: { opacity: 0 },
            }}
          >
            {BUTTONS.map(({ label, href, icon }) => (
              <Tooltip key={label} label={label}>
                <Button asChild className='text-xl'>
                  <Link href={href}>{icon}</Link>
                </Button>
              </Tooltip>
            ))}
          </Transition>
        )}
      </AnimatePresence>
    </div>
  );
}
