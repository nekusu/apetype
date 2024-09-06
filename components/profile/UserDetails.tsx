'use client';

import { Button, Divider, Grid, Group, Text, Tooltip, Transition } from '@/components/core';
import { socialIcons, socialNames, socialURLs } from '@/utils/socials';
import type { User } from '@/utils/user';
import { useDidUpdate } from '@mantine/hooks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { type ReactNode, useState } from 'react';
import { RiCalendarEventFill, RiGlobalFill } from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';
import { Banner, ProfilePicture } from '.';

dayjs.extend(relativeTime);

export interface UserDetailsProps {
  user: User;
  actions?: ReactNode;
  editable?: boolean;
}

interface SocialButtonProps {
  url?: string;
  value?: string;
  icon: ReactNode;
}

function SocialButton({ url, value, icon }: SocialButtonProps) {
  return (
    <Tooltip className='bg-bg' label={value ?? url}>
      <Button
        asChild
        className='p-0 text-2xl text-text hover:text-main focus-visible:text-main'
        variant='text'
      >
        <a href={`https://${url}`} target='_blank' rel='noopener noreferrer'>
          {icon}
        </a>
      </Button>
    </Tooltip>
  );
}

function formatTime(time: number) {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  let timeString = '';
  if (hours) timeString += `${hours}h `;
  if (minutes) timeString += `${minutes}m `;
  if (seconds) timeString += `${seconds}s`;

  return timeString;
}

export default function UserDetails({
  user: { name, joinedAt, profilePicture, bannerURL, bio, keyboard, socials, typingStats },
  actions,
  editable,
}: UserDetailsProps) {
  const { startedTests, completedTests, timeTyping } = typingStats;
  const restartsPerTest = (startedTests - completedTests) / completedTests;
  const [isBannerHovered, setBannerHovered] = useState(false);
  const [showBlurredBanner, setShowBlurredBanner] = useState(false);
  const smallProfilePicture = isBannerHovered || !(editable || bannerURL);

  useDidUpdate(() => {
    setShowBlurredBanner(false);
  }, [bannerURL]);

  return (
    <div className='relative'>
      <AnimatePresence>
        {showBlurredBanner && bannerURL && (
          <Transition className='-z-10 absolute aspect-[4/1] w-full' transition={{ duration: 0.5 }}>
            <Image
              className='rounded-t-xl blur-[350px]'
              src={bannerURL}
              alt={'Blurred banner'}
              fill
            />
          </Transition>
        )}
      </AnimatePresence>
      <div className='overflow-hidden rounded-xl bg-sub-alt transition-colors'>
        {(editable || bannerURL) && (
          <Banner
            editable={editable}
            imageProps={{
              src: bannerURL,
              onLoad: () => setShowBlurredBanner(true),
              onMouseOver: () => setBannerHovered(true),
              onMouseLeave: () => setBannerHovered(false),
            }}
          />
        )}
        <div className='grid cursor-default grid-cols-[1fr_180px] grid-rows-[36px_auto] gap-x-6 gap-y-4 p-6'>
          <div className='flex justify-between gap-2'>
            <div className='relative'>
              <ProfilePicture
                editable={editable}
                imageProps={{ src: profilePicture?.url }}
                shape={profilePicture?.shape}
                wrapperClassName={twJoin(
                  'absolute bottom-0 left-0 origin-bottom-left transition duration-300',
                  smallProfilePicture && 'translate-y-12 scale-[0.4375] delay-500',
                )}
                className={twJoin(smallProfilePicture && 'border-0 delay-500')}
              />
            </div>
            {actions}
          </div>
          <div className='row-span-2 flex flex-col justify-evenly rounded-lg bg-bg py-0.5 transition-colors'>
            <div className='px-2 py-1.5'>
              <Text className='text-center text-sm' dimmed>
                tests started
              </Text>
              <Text className='text-center text-lg'>{startedTests}</Text>
            </div>
            <Divider className='bg-sub-alt' orientation='horizontal' />
            <Tooltip
              disabled={!startedTests}
              label={`${+restartsPerTest.toFixed(1)} restarts per completed test`}
            >
              <div className='px-2 py-1.5'>
                <Text className='text-center text-sm' dimmed>
                  tests completed
                </Text>
                <Text className='text-center text-lg'>
                  {completedTests}{' '}
                  {startedTests > 0 && (
                    <span className='opacity-50'>
                      {`(${Math.round((completedTests / startedTests) * 100)}%)`}
                    </span>
                  )}
                </Text>
              </div>
            </Tooltip>
            <Divider className='bg-sub-alt' orientation='horizontal' />
            <div className='px-2 py-1.5'>
              <Text className='text-center text-sm' dimmed>
                time typing
              </Text>
              <Text className='text-center text-lg'>
                {timeTyping > 0 ? formatTime(timeTyping) : '0s'}
              </Text>
            </div>
          </div>
          <Grid className='grid-cols-[1.5fr_1fr] gap-6'>
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-3'>
                <Text
                  asChild
                  className={twJoin(
                    'origin-left text-3xl text-main duration-300',
                    smallProfilePicture &&
                      '-translate-y-7 translate-x-[104px] scale-[1.25] delay-500',
                  )}
                >
                  <h2>{name}</h2>
                </Text>
                {bio && (
                  <Text asChild className='whitespace-pre-wrap'>
                    <p>{bio}</p>
                  </Text>
                )}
              </div>
              <Text className='flex items-center gap-1 text-sm' dimmed>
                <RiCalendarEventFill />
                Joined{' '}
                <Tooltip className='bg-bg' label={dayjs(joinedAt).fromNow()}>
                  <span>{dayjs(joinedAt).format('DD MMM YYYY')}</span>
                </Tooltip>
              </Text>
            </div>
            <div className='flex flex-col gap-4'>
              {keyboard && (
                <div className='flex flex-col gap-1'>
                  <Text asChild className='text-sm' dimmed>
                    <h5>keyboard</h5>
                  </Text>
                  <Text asChild className='whitespace-pre-wrap text-sm'>
                    <p>{keyboard}</p>
                  </Text>
                </div>
              )}
              {socials && Object.values(socials).some(Boolean) && (
                <div className='flex flex-col gap-1'>
                  <Text asChild className='text-sm' dimmed>
                    <h5>socials</h5>
                  </Text>
                  <Group grow={false}>
                    {socialNames.map(
                      (name) =>
                        socials[name] && (
                          <SocialButton
                            key={name}
                            url={`${socialURLs[name]}${socials[name]}`}
                            value={socials[name]}
                            icon={socialIcons[name]}
                          />
                        ),
                    )}
                    {socials.website && (
                      <SocialButton url={socials.website} icon={<RiGlobalFill />} />
                    )}
                  </Group>
                </div>
              )}
            </div>
          </Grid>
        </div>
      </div>
    </div>
  );
}
