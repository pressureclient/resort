import { redirect } from 'next/navigation';
import { getUser, isConfigured } from '@/lib/supabase/server';
import { AuthForm } from '@/components/Forms';
import { SetupNotice } from '@/components/Bits';

// Staff sign-in only. Guests book without an account, and public sign-up is closed.
export const metadata = { title: 'Staff sign in', robots: { index: false, follow: false } };
type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function Login({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const raw = typeof sp.next === 'string' ? sp.next : '/admin';
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/admin';
  if (await getUser()) redirect(next);

  return (
    <section className="page-head">
      <div className="wrap auth">
        <h1 style={{ fontSize: '2.6rem' }}>Staff sign in</h1>
        <p className="muted">For La Luz staff. Guests can book without an account and find their booking under <a className="link" href="/account">My Bookings</a>.</p>
        {!isConfigured && <SetupNotice />}
        {sp.confirmed === '1' && <p className="msg ok">Your email is confirmed. Sign in to continue.</p>}
        <div className="panel"><AuthForm mode="signin" next={next} /></div>
      </div>
    </section>
  );
}
