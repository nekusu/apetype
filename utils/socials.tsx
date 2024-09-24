import type { ReactNode } from 'react';
import {
  RiGithubFill,
  RiGlobalFill,
  RiTwitchFill,
  RiTwitterXFill,
  RiYoutubeFill,
} from 'react-icons/ri';
import { twJoin } from 'tailwind-merge';
import { lexendDeca } from './fonts';
import type { TableRow } from './supabase/database-extended';

export type SocialKey = keyof TableRow<'users'>['socials'];
export const socialsData: Record<SocialKey, { icon: ReactNode; url: string }> = {
  monkeytype: {
    icon: (
      <span
        className={twJoin(
          'flex h-[1.334em] w-[1.334em] items-center justify-center text-[0.75em]',
          lexendDeca.className,
        )}
      >
        mt
      </span>
    ),
    url: 'monkeytype.com/profile/',
  },
  x: {
    icon: <RiTwitterXFill />,
    url: 'x.com/',
  },
  github: {
    icon: <RiGithubFill />,
    url: 'github.com/',
  },
  youtube: {
    icon: <RiYoutubeFill />,
    url: 'youtube.com/@',
  },
  twitch: {
    icon: <RiTwitchFill />,
    url: 'twitch.tv/',
  },
  website: {
    icon: <RiGlobalFill />,
    url: '',
  },
};
