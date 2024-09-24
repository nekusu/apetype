import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/';
  if (!code) return NextResponse.redirect(origin);
  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(origin);
  const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
  const isLocalEnv = process.env.NODE_ENV === 'development';
  // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
  if (isLocalEnv) return NextResponse.redirect(`${origin}${next}`);
  if (forwardedHost) return NextResponse.redirect(`https://${forwardedHost}${next}`);
  return NextResponse.redirect(`${origin}${next}`);
}
