'use client';

import { Button, Text, Tooltip, Transition } from 'components/core';
import { ProfilePicture } from 'components/profile';
import { useGlobal } from 'context/globalContext';
import { useUser } from 'context/userContext';
import { AnimatePresence, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Fragment, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  RiInformationFill,
  RiKeyboardBoxFill,
  RiLoginCircleFill,
  RiLogoutCircleRFill,
  RiSettingsFill,
  RiVipCrownFill,
} from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';
import { getFirebaseAuth } from 'utils/firebase';
import LogoIcon from './LogoIcon';

const BUTTONS = [
  { label: 'Home', href: '/', icon: <RiKeyboardBoxFill /> },
  { label: 'Leaderboards', href: '/leaderboards', icon: <RiVipCrownFill /> },
  { label: 'About', href: '/about', icon: <RiInformationFill /> },
  { label: 'Settings', href: '/settings', icon: <RiSettingsFill /> },
];
const VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delay: 0.25, duration: 0.5 } },
  exit: { opacity: 0 },
};

export default function Header() {
  const { testId, isUserTyping, restartTest } = useGlobal();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const animationControls = useAnimation();

  const logout = useCallback(async () => {
    const { auth, signOut } = await getFirebaseAuth();
    await signOut(auth);
    toast.success('Signed out! See you next time!');
  }, []);

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
          <Fragment key='routes'>
            <Transition className='flex items-center gap-1.5' variants={VARIANTS}>
              {BUTTONS.map(({ label, href, icon }) => (
                <Tooltip key={label} label={label}>
                  <Button asChild className='text-xl'>
                    <Link href={href}>{icon}</Link>
                  </Button>
                </Tooltip>
              ))}
            </Transition>
            <Transition className='flex items-center gap-1.5' variants={VARIANTS}>
              {user && pathname !== '/account' && (
                <Button asChild className='text-sm'>
                  <Link href='/account'>
                    <ProfilePicture
                      className='w-5 border-0 bg-sub-alt'
                      expandable={false}
                      imageProps={{ src: user.profilePicture?.url }}
                    />
                    {user.name}
                  </Link>
                </Button>
              )}
              <Tooltip label={`Sign ${user ? 'out' : 'in'}`}>
                {user ? (
                  <Button className='text-xl' onClick={() => void logout()}>
                    <RiLogoutCircleRFill />
                  </Button>
                ) : (
                  <Button asChild className='text-xl'>
                    <Link href='/login'>
                      <RiLoginCircleFill />
                    </Link>
                  </Button>
                )}
              </Tooltip>
            </Transition>
          </Fragment>
        )}
      </AnimatePresence>
    </div>
  );
}
