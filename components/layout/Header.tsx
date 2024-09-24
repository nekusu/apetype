'use client';

import { signOut } from '@/app/@auth/actions';
import { Button } from '@/components/core/Button';
import { Grid } from '@/components/core/Grid';
import { Text } from '@/components/core/Text';
import { Tooltip } from '@/components/core/Tooltip';
import { Transition } from '@/components/core/Transition';
import { Avatar } from '@/components/profile/Avatar';
import { useGlobal } from '@/context/globalContext';
import { useUser } from '@/context/userContext';
import { lexendDeca } from '@/utils/fonts';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  RiInformationFill,
  RiKeyboardBoxFill,
  RiLoaderLine,
  RiLoginCircleFill,
  RiLogoutCircleRFill,
  RiSettingsFill,
  RiVipCrownFill,
} from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';
import { LogoIcon } from './LogoIcon';

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

export function Header() {
  const queryClient = useQueryClient();
  const { testId, isUserTyping, restartTest } = useGlobal();
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const animationControls = useAnimation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const res = await signOut();
      if (res?.error) throw res.error;
      queryClient.removeQueries({
        predicate: ({ queryKey }) =>
          queryKey.includes('users') ||
          queryKey.includes('user_stats') ||
          queryKey.includes('personal_bests') ||
          queryKey.includes('tests'),
      });
      toast.success('You have been signed out. Come back soon!');
    } catch (e) {
      toast.error(`Failed to sign out! ${(e as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: this is intentional
  useEffect(() => {
    if (!isUserTyping)
      animationControls.start({
        pathOffset: [0, 1, 2],
        transition: { duration: 1 },
      });
  }, [isUserTyping, animationControls, testId]);

  return (
    <Grid className='relative z-10 w-full select-none grid-cols-[auto_1fr_auto] gap-3'>
      <div
        className={twJoin(
          'flex cursor-pointer items-center gap-2 transition-transform active:translate-y-0.5',
          lexendDeca.className,
        )}
        onClick={() => {
          if (pathname === '/') restartTest();
          else router.push('/');
        }}
      >
        <LogoIcon
          className={twJoin('animate-fade-in', isUserTyping ? 'stroke-sub' : 'stroke-main')}
          controls={animationControls}
        />
        <Transition transition={{ duration: 0.75 }}>
          <Text className='relative mb-[7px] text-[32px] leading-none' dimmed={isUserTyping}>
            <AnimatePresence>
              {!isUserTyping && (
                <Transition
                  className='-top-[3px] absolute left-3'
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
                  <Button asChild className='px-2 text-xl' variant='text'>
                    <Link href={href}>{icon}</Link>
                  </Button>
                </Tooltip>
              ))}
            </Transition>
            <Transition className='flex items-center gap-1.5' variants={VARIANTS}>
              {user && pathname !== '/account' && (
                <Button asChild className='px-2 text-sm' variant='text'>
                  <Link href='/account'>
                    <Avatar
                      className='border-0 bg-sub-alt'
                      expandable={false}
                      imageProps={{ src: user.avatarURL, height: 20, width: 20 }}
                    />
                    {user.name}
                  </Link>
                </Button>
              )}
              <Tooltip label={`Sign ${user ? 'out' : 'in'}`}>
                {user ? (
                  isLoading ? (
                    <div className='p-2 text-xl'>
                      <RiLoaderLine className='animate-spin text-main' />
                    </div>
                  ) : (
                    <Button className='px-2 text-xl' onClick={handleSignOut} variant='text'>
                      <RiLogoutCircleRFill />
                    </Button>
                  )
                ) : (
                  <Button asChild className='px-2 text-xl' variant='text'>
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
    </Grid>
  );
}
