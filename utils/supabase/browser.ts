import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database-extended';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export default createClient();
