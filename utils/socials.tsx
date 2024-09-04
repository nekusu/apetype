import type { ReactNode } from 'react';
import { RiGithubFill, RiTwitchFill, RiTwitterFill, RiYoutubeFill } from 'react-icons/ri';

export const socialNames = ['monkeytype', 'github', 'twitter', 'youtube', 'twitch'] as const;
export type Social = (typeof socialNames)[number];
export const socialIcons: Record<Social, ReactNode> = {
  monkeytype: (
    <span className='flex h-[1.334em] w-[1.334em] items-center justify-center font-[var(--font-lexend-deca)] text-[0.75em]'>
      mt
    </span>
  ),
  github: <RiGithubFill />,
  twitter: <RiTwitterFill />,
  youtube: <RiYoutubeFill />,
  twitch: <RiTwitchFill />,
};
export const socialURLs: Record<Social, string> = {
  monkeytype: 'monkeytype.com/profile/',
  github: 'github.com/',
  twitter: 'twitter.com/',
  youtube: 'youtube.com/@',
  twitch: 'twitch.tv/',
};
