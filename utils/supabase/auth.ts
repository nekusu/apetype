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
