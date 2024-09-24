'use server';

import { getURL } from '@/utils/supabase/auth';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceRoleClient } from '@supabase/supabase-js';
import type { Provider } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

interface FormValues {
  username?: string;
  email: string;
  password: string;
}

function parse<T>(res: T) {
  return JSON.parse(JSON.stringify(res)) as T;
}

export async function signInWithPassword({ email, password }: Omit<FormValues, 'username'>) {
  const supabase = createClient();
  const res = await supabase.auth.signInWithPassword({ email, password });
  const { data, error } = res;
  if (error) {
    const { data: emailExists } = await supabase.rpc('check_email', { emailToCheck: email });
    if (emailExists)
      return {
        data,
        error: { ...parse(error), code: 'wrong_password', message: 'Wrong password' },
      };
    return parse(res);
  }
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signInWithProvider(provider: Provider) {
  const supabase = createClient();
  const res = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${getURL()}/auth/callback` },
  });
  if (res.error) return parse(res);
  if (res.data.url) redirect(res.data.url);
}

export async function checkUsername(name: string) {
  const supabase = createClient();
  const res = await supabase.from('users').select('name').eq('name', name).maybeSingle();
  if (res.error) return parse(res);
  return { data: !!res.data, error: null };
}

export async function signUpWithPassword({ username, email, password }: Required<FormValues>) {
  const supabase = createClient();
  const { data: usernameExists } = await checkUsername(username);
  if (usernameExists)
    return { error: { code: 'username_already_in_use', message: 'Username is already taken' } };
  const { data: emailExists } = await supabase.rpc('check_email', { emailToCheck: email });
  if (emailExists)
    return { error: { code: 'email_already_in_use', message: 'Email is already in use' } };
  const res = await supabase.auth.signUp({
    email,
    password,
    options: {
      // biome-ignore lint/style/useNamingConvention: metadata is not camelCase
      data: { name: username, password_authenticated: true },
      emailRedirectTo: `${getURL()}/auth/confirm`,
    },
  });
  if (res.error) return parse(res);
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signOut() {
  const supabase = createClient();
  const res = await supabase.auth.signOut({ scope: 'local' });
  if (res.error) return parse(res);
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function deleteUser(id: string) {
  const supabase = createServiceRoleClient(
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  const res = await supabase.auth.admin.deleteUser(id);
  if (res.error) return parse(res);
  revalidatePath('/', 'layout');
  redirect('/');
}
