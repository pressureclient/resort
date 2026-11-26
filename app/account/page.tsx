import Link from 'next/link';
import { getProfile, isConfigured, supabaseServer } from '@/lib/supabase/server';
import { money2, prettyDate, today } from '@/lib/format';
import { SetupNotice } from '@/components/Bits';
import { FindBookingForm } from '@/components/Forms';

export const metadata = { title: 'My Bookings' };
type Row = {
  id: string; ref: string; check_in: string; check_out: string; adults: number; children: number; rooms: number;
  total: number; access_token: string; status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  room: { name: string; slug: string } | null;
};

export default async function Account() {
  if (!isConfigured) {
    return <section className="page-head"><div className="wrap"><h1>My Bookings</h1><SetupNotice /></div></section>;
  }
  const { user, fullName } = await getProfile();

  // Guests who booked without an account find their booking with reference + email.
  if (!user) {
    return (
      <section className="page-head">
        <div className="wrap" style={{ maxWidth: 760 }}>
          <span className="label">Guest help</span>
          <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>My Bookings</h1>
          <p className="lead">Find your booking with the reference from your confirmation and the email you booked with. No account needed.</p>
          <div className="panel"><FindBookingForm /></div>
          <p className="muted small" style={{ marginTop: 18 }}>
            Have an account? <Link className="link" href="/login?next=/account">Sign in</Link> to see all bookings made with your email.
          </p>
        </div>
      </section>
    );
  }

  const sb = await supabaseServer();
  const email = (user.email ?? '').toLowerCase();
  const { data } = await sb
    .from('bookings')
    .select('id, ref, check_in, check_out, adults, children, rooms, total, access_token, status, room:room_id(name, slug)')
    .or(`user_id.eq.${user.id}${email ? `,guest_email.eq."${email}"` : ''}`)
    .order('check_in', { ascending: false });
  const rows = (data ?? []) as unknown as Row[];
  const t = today();
  const upcoming = rows.filter((r) => r.check_out >= t && r.status !== 'cancelled');
  const past = rows.filter((r) => !upcoming.includes(r));

  const Item = ({ r }: { r: Row }) => {
    const link = `/booking/${r.ref}?t=${r.access_token}`;
    const canCancel = (r.status === 'pending' || r.status === 'confirmed') && r.check_in > t;
    return (
      <article className="bk">
        <div>
          <span className={`status ${r.status}`}>{r.status}</span>
          <h3 style={{ marginTop: 8 }}>{r.rooms > 1 ? `${r.rooms} × ` : ''}{r.room?.name ?? 'Room'}</h3>
          <div className="meta">
            <span>{prettyDate(r.check_in)} to {prettyDate(r.check_out)}</span>
            <span>{r.adults} {r.adults === 1 ? 'adult' : 'adults'}{r.children ? `, ${r.children} ${r.children === 1 ? 'child' : 'children'}` : ''}</span>
            <span>{money2(r.total)}</span>
            <span>Ref <b>{r.ref}</b></span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href={link} className="btn btn-ghost btn-sm">View</Link>
          {canCancel && <Link href={`${link}&cancel=1`} className="btn btn-ghost btn-sm">Cancel</Link>}
        </div>
      </article>
    );
  };

  return (
    <section className="page-head">
      <div className="wrap" style={{ maxWidth: 980 }}>
        <div className="head" style={{ marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)', marginBottom: 4 }}>My Bookings</h1>
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
        <details style={{ marginTop: 32 }}>
          <summary className="link" style={{ cursor: 'pointer' }}>Booked with a different email? Find a booking by reference</summary>
          <div className="panel" style={{ marginTop: 12 }}><FindBookingForm /></div>
        </details>
      </div>
    </section>
  );
}
