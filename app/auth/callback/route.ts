import { NextResponse, type NextRequest } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

// Supabase sends guests here from the confirmation email.
// The email is already confirmed by the time they arrive. If the link is opened in a
// different browser from the one used to sign up, the automatic sign-in can't finish,
// so we send them to sign in with a "confirmed" note instead of an error.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const nextParam = searchParams.get('next') ?? '/account';
  const next = nextParam.startsWith('/') && !nextParam.startsWith('//') ? nextParam : '/account';
  const login = (flag: string) => NextResponse.redirect(`${origin}/login?${flag}&next=${encodeURIComponent(next)}`);

  if (searchParams.get('error') || searchParams.get('error_description')) return login('error=confirm');
  if (!code) return login('error=confirm');

  const sb = await supabaseServer();
  const { error } = await sb.auth.exchangeCodeForSession(code);
  if (!error) return NextResponse.redirect(`${origin}${next}`);
  return login('confirmed=1');
}
