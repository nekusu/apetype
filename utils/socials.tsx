import { ReactNode } from 'react';
import { RiGithubFill, RiTwitchFill, RiTwitterFill, RiYoutubeFill } from 'react-icons/ri';

export const socialNames = ['monkeytype', 'github', 'twitter', 'youtube', 'twitch'] as const;
export type Social = (typeof socialNames)[number];
export const socialIcons: Record<Social, ReactNode> = {
  monkeytype: (
    <span className='h-[1.334em] w-[1.334em] flex items-center justify-center text-[0.75em] font-[var(--font-lexend-deca)]'>
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
