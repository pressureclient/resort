import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProfile, isConfigured, supabaseServer } from '@/lib/supabase/server';
import { setBookingStatus } from '@/lib/actions';
import { money, prettyDate, today } from '@/lib/format';
import { SetupNotice } from '@/components/Bits';

export const metadata = { title: 'Admin' };
type SP = Promise<Record<string, string | string[] | undefined>>;
type Row = {
  id: string; ref: string; guest_name: string; phone: string | null; notes: string | null; check_in: string; check_out: string;
  guests: number; total: number; status: string; created_at: string; rooms: { name: string } | null;
};
const STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

export default async function Admin({ searchParams }: { searchParams: SP }) {
  if (!isConfigured) return <section className="page-head"><div className="wrap"><h1>Admin</h1><SetupNotice /></div></section>;
  const { user, isAdmin } = await getProfile();
  if (!user) redirect('/login?next=/admin');
  if (!isAdmin) {
    return (
      <section className="page-head"><div className="wrap">
        <h1>Admin</h1>
        <div className="empty">This account is not an admin. Follow the README step &ldquo;Make yourself admin&rdquo; to get access.</div>
      </div></section>
    );
  }

  const sp = await searchParams;
  const filter = typeof sp.status === 'string' && STATUSES.includes(sp.status) ? sp.status : 'all';
  const view = sp.view === 'past' ? 'past' : 'upcoming';
  const t = today();
  const sb = await supabaseServer();

  let q = sb.from('bookings')
    .select('id, ref, guest_name, phone, notes, check_in, check_out, guests, total, status, created_at, rooms(name)')
    .limit(200);
  q = view === 'upcoming' ? q.gte('check_out', t).order('check_in', { ascending: true }) : q.lt('check_out', t).order('check_in', { ascending: false });
  if (filter !== 'all') q = q.eq('status', filter);
  const [{ data }, { data: all }, { data: enquiries }, { count: subs }] = await Promise.all([
    q,
    sb.from('bookings').select('status, total, check_in, check_out').gte('check_out', t),
    sb.from('enquiries').select('*').order('created_at', { ascending: false }).limit(20),
    sb.from('subscribers').select('*', { count: 'exact', head: true }),
  ]);
  const rows = (data ?? []) as unknown as Row[];
  const live = (all ?? []) as { status: string; total: number; check_in: string; check_out: string }[];
  const active = live.filter((b) => b.status === 'pending' || b.status === 'confirmed');

  const stats = [
    { k: 'Waiting for you', v: String(live.filter((b) => b.status === 'pending').length) },
    { k: 'Arriving today', v: String(active.filter((b) => b.check_in === t).length) },
    { k: 'Guests in house', v: String(active.filter((b) => b.check_in <= t && b.check_out > t).length) },
    { k: 'Upcoming confirmed value', v: money(live.filter((b) => b.status === 'confirmed').reduce((s, b) => s + b.total, 0)) },
  ];
  const href = (p: Record<string, string>) => `/admin?${new URLSearchParams({ view, status: filter, ...p })}`;

  return (
    <section className="page-head">
      <div className="wrap">
        <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>Front desk</h1>
        <div className="stats">{stats.map((s) => <div className="stat" key={s.k}><span>{s.k}</span><b>{s.v}</b></div>)}</div>

        <div className="head" style={{ marginBottom: 12 }}>
          <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Bookings</h2>
          <div className="filters" style={{ margin: 0 }}>
            <Link href={href({ view: 'upcoming' })} className={view === 'upcoming' ? 'on' : ''}>Upcoming</Link>
            <Link href={href({ view: 'past' })} className={view === 'past' ? 'on' : ''}>Past</Link>
          </div>
        </div>
        <div className="filters">
          {['all', ...STATUSES].map((s) => (
            <Link key={s} href={href({ status: s })} className={filter === s ? 'on' : ''} style={{ textTransform: 'capitalize' }}>{s}</Link>
          ))}
        </div>
        {rows.length === 0 ? <div className="empty">No bookings here yet.</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Ref</th><th>Guest</th><th>Room</th><th>Stay</th><th>Guests</th><th>Total</th><th>Notes</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><b>{r.ref}</b></td>
                    <td>{r.guest_name}<div className="muted small">{r.phone ?? ''}</div></td>
                    <td>{r.rooms?.name}</td>
                    <td>{prettyDate(r.check_in)}<div className="muted small">to {prettyDate(r.check_out)}</div></td>
                    <td>{r.guests}</td>
                    <td>{money(r.total)}</td>
                    <td style={{ whiteSpace: 'normal', minWidth: 160, maxWidth: 260 }} className="small">{r.notes ?? <span className="muted">None</span>}</td>
                    <td>
                      <form action={setBookingStatus} className="inline-form">
                        <input type="hidden" name="id" value={r.id} />
                        <select name="status" defaultValue={r.status} aria-label={`Status for ${r.ref}`}>
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button className="btn btn-ghost btn-sm" type="submit" style={{ height: 34 }}>Save</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <h2 style={{ fontSize: '1.5rem', marginTop: 48 }}>Latest enquiries</h2>
        <p className="muted small">{subs ?? 0} newsletter subscribers. Edit rooms, prices and units in Supabase under Table Editor &gt; rooms.</p>
        {!enquiries?.length ? <div className="empty">No enquiries yet.</div> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Received</th><th>Name</th><th>Contact</th><th>Dates</th><th>Message</th></tr></thead>
              <tbody>
                {enquiries.map((e) => (
                  <tr key={e.id}>
                    <td>{new Date(e.created_at).toLocaleDateString('en-GB')}</td>
                    <td>{e.name}</td>
                    <td><a className="link" href={`mailto:${e.email}`}>{e.email}</a><div className="muted small">{e.phone ?? ''}</div></td>
                    <td>{e.arrival ? `${prettyDate(e.arrival)}${e.departure ? ` to ${prettyDate(e.departure)}` : ''}` : <span className="muted">Not given</span>}</td>
                    <td style={{ whiteSpace: 'normal', minWidth: 220 }} className="small">{e.message ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
