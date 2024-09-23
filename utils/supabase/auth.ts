import type { Provider } from '@supabase/supabase-js';
import type { IconType } from 'react-icons';
import { RiGithubFill, RiGoogleFill } from 'react-icons/ri';

export interface AuthMethod {
  name: string;
  provider: Provider;
  icon: IconType;
}

export const authMethods: AuthMethod[] = [
  { name: 'Google', provider: 'google', icon: RiGoogleFill },
  { name: 'GitHub', provider: 'github', icon: RiGithubFill },
];

export function getURL() {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Site URL in production env
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel
    'http://localhost:3000';
  // Make sure to include `https://` when not localhost.
  url = url.startsWith('http://') ? url : `https://${url}`;
  return url;
}
