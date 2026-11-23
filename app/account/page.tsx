import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProfile, isConfigured, supabaseServer } from '@/lib/supabase/server';
import { cancelBooking } from '@/lib/actions';
import { money, prettyDate, today } from '@/lib/format';
import { SetupNotice } from '@/components/Bits';
import { Submit } from '@/components/Forms';

export const metadata = { title: 'My bookings' };
type SP = Promise<Record<string, string | string[] | undefined>>;
type Row = {
  id: string; ref: string; check_in: string; check_out: string; guests: number; total: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'; rooms: { name: string; slug: string } | null;
};

export default async function Account({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  if (!isConfigured) {
    return <section className="page-head"><div className="wrap"><h1>My bookings</h1><SetupNotice /></div></section>;
  }
  const { user, fullName } = await getProfile();
  if (!user) redirect('/login?next=/account');

  const sb = await supabaseServer();
  const { data } = await sb
    .from('bookings')
    .select('id, ref, check_in, check_out, guests, total, status, rooms(name, slug)')
    .order('check_in', { ascending: false });
  const rows = (data ?? []) as unknown as Row[];
  const t = today();
  const upcoming = rows.filter((r) => r.check_out >= t && r.status !== 'cancelled');
  const past = rows.filter((r) => !upcoming.includes(r));

  const Item = ({ r }: { r: Row }) => {
    const canCancel = (r.status === 'pending' || r.status === 'confirmed') && r.check_in > t;
    return (
      <article className="bk">
        <div>
          <span className={`status ${r.status}`}>{r.status}</span>
          <h3 style={{ marginTop: 8 }}>{r.rooms?.name ?? 'Room'}</h3>
          <div className="meta">
            <span>{prettyDate(r.check_in)} to {prettyDate(r.check_out)}</span>
            <span>{r.guests} {r.guests === 1 ? 'guest' : 'guests'}</span>
            <span>{money(r.total)}</span>
            <span>Ref <b>{r.ref}</b></span>
          </div>
        </div>
        {canCancel && (
          <form action={cancelBooking}>
            <input type="hidden" name="id" value={r.id} />
            <Submit className="btn btn-ghost btn-sm">Cancel booking</Submit>
          </form>
        )}
      </article>
    );
  };

  return (
    <section className="page-head">
      <div className="wrap" style={{ maxWidth: 980 }}>
        {typeof sp.booked === 'string' && (
          <>
            <div className="steps"><span>1. Dates and room</span><span>2. Your details</span><span className="on">3. Booked</span></div>
            <p className="msg ok" style={{ marginBottom: 24 }}>Booking received. Your reference is <b>{sp.booked}</b>. We will confirm it shortly.</p>
          </>
        )}
        <div className="head" style={{ marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 4 }}>My bookings</h1>
            <p className="muted" style={{ margin: 0 }}>{fullName ?? user.email}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/book" className="btn btn-primary">New booking</Link>
            <form action="/auth/signout" method="post"><button className="btn btn-ghost" type="submit">Sign out</button></form>
          </div>
        </div>
        <h2 style={{ fontSize: '1.4rem' }}>Upcoming</h2>
        {upcoming.length ? upcoming.map((r) => <Item key={r.id} r={r} />) : (
          <div className="empty" style={{ marginBottom: 24 }}>No upcoming stays. <Link href="/book" className="link">Find dates</Link></div>
        )}
        {past.length > 0 && (
          <>
            <h2 style={{ fontSize: '1.4rem', marginTop: 32 }}>Past and cancelled</h2>
            {past.map((r) => <Item key={r.id} r={r} />)}
          </>
        )}
      </div>
    </section>
  );
}
