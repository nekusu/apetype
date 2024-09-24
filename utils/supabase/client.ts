import { createClient as _createClient } from '@supabase/supabase-js';
import type { Database } from './database-extended';

export function createClient() {
  return _createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
