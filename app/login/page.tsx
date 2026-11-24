import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser, isConfigured } from '@/lib/supabase/server';
import { AuthForm } from '@/components/Forms';
import { SetupNotice } from '@/components/Bits';

export const metadata = { title: 'Sign in' };
type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function Login({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const raw = typeof sp.next === 'string' ? sp.next : '/account';
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/account';
  const mode = sp.mode === 'signup' ? 'signup' : 'signin';
  if (await getUser()) redirect(next);
  const q = (m: string) => `/login?mode=${m}&next=${encodeURIComponent(next)}`;

  return (
    <section className="page-head">
      <div className="wrap auth">
        <h1 style={{ fontSize: '2.6rem' }}>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="muted">{next.startsWith('/book') ? 'Sign in to finish your booking. Your dates are saved.' : 'Manage your bookings in one place.'}</p>
        {!isConfigured && <SetupNotice />}
        {sp.confirmed === '1' && <p className="msg ok">Your email is confirmed. Sign in to continue.</p>}
        {sp.error === 'confirm' && <p className="msg err">That confirmation link has expired. Sign in, or create the account again to get a new link.</p>}
        <div className="tabs">
          <Link href={q('signin')} className={mode === 'signin' ? 'on' : ''}>Sign in</Link>
          <Link href={q('signup')} className={mode === 'signup' ? 'on' : ''}>Create account</Link>
        </div>
        <div className="panel"><AuthForm key={mode} mode={mode} next={next} /></div>
      </div>
    </section>
  );
}
