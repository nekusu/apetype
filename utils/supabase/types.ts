import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database-extended';

export type TypedSupabaseClient = SupabaseClient<Database>;
