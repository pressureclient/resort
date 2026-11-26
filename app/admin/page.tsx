import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProfile, isConfigured, supabaseServer } from '@/lib/supabase/server';
import { saveCharges, savePaymentMethod, savePromo, setBookingStatus, setPaymentStatus, togglePromo } from '@/lib/actions';
import { money, money2, prettyDate, today } from '@/lib/format';
import { SetupNotice } from '@/components/Bits';

export const metadata = { title: 'Admin' };
type SP = Promise<Record<string, string | string[] | undefined>>;
type Row = {
  id: string; ref: string; guest_name: string; phone: string | null; notes: string | null; check_in: string; check_out: string;
  guests: number; adults: number; children: number; rooms: number; guest_email: string | null; fee: number; total: number; status: string; created_at: string; room: { name: string } | null;
  payment_method: string | null; payment_status: string; receipt_path: string | null; country: string | null; promo_code: string | null;
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
    .select('id, ref, guest_name, guest_email, phone, notes, check_in, check_out, guests, adults, children, rooms, fee, total, status, created_at, payment_method, payment_status, receipt_path, country, promo_code, room:room_id(name)')
    .limit(200);
  q = view === 'upcoming' ? q.gte('check_out', t).order('check_in', { ascending: true }) : q.lt('check_out', t).order('check_in', { ascending: false });
  if (filter !== 'all') q = q.eq('status', filter);
  const [{ data }, { data: all }, { data: enquiries }, { count: subs }, { data: settings }, { data: methods }, { data: promos }] = await Promise.all([
    q,
    sb.from('bookings').select('status, total, check_in, check_out').gte('check_out', t),
    sb.from('enquiries').select('*').order('created_at', { ascending: false }).limit(20),
    sb.from('subscribers').select('*', { count: 'exact', head: true }),
    sb.from('settings').select('vat_percent, service_percent').maybeSingle(),
    sb.from('payment_methods').select('*').order('sort'),
    sb.from('promo_codes').select('*').order('created_at', { ascending: false }),
  ]);
  const rows = (data ?? []) as unknown as Row[];
  // Short-lived private links to uploaded receipts (receipts bucket is admin-only).
  const receiptUrls: Record<string, string> = {};
  await Promise.all(rows.filter((r) => r.receipt_path).map(async (r) => {
    const { data: u } = await sb.storage.from('receipts').createSignedUrl(r.receipt_path!, 60 * 60);
    if (u?.signedUrl) receiptUrls[r.id] = u.signedUrl;
  }));
  const payLabel: Record<string, string> = { unpaid: 'Awaiting payment', receipt_uploaded: 'Receipt uploaded', paid: 'Paid' };
  const live = (all ?? []) as { status: string; total: number; check_in: string; check_out: string }[];
  const active = live.filter((b) => b.status === 'pending' || b.status === 'confirmed');

  const stats = [
    { k: 'Waiting for you', v: String(live.filter((b) => b.status === 'pending').length) },
    { k: 'Receipts to check', v: String(rows.filter((b) => b.payment_status === 'receipt_uploaded').length) },
    { k: 'Arriving today', v: String(active.filter((b) => b.check_in === t).length) },
    { k: 'Guests in house', v: String(active.filter((b) => b.check_in <= t && b.check_out > t).length) },
    { k: 'Upcoming confirmed value', v: money(live.filter((b) => b.status === 'confirmed').reduce((s, b) => s + Number(b.total), 0)) },
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
              <thead><tr><th>Ref</th><th>Guest</th><th>Room</th><th>Stay</th><th>Guests</th><th>Total</th><th>Notes</th><th>Payment</th><th>Status</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><b>{r.ref}</b></td>
                    <td>{r.guest_name}<div className="muted small">{r.guest_email ?? ''}{r.guest_email && r.phone ? ' · ' : ''}{r.phone ?? ''}</div></td>
                    <td>{r.rooms > 1 ? `${r.rooms} × ` : ''}{r.room?.name}</td>
                    <td>{prettyDate(r.check_in)}<div className="muted small">to {prettyDate(r.check_out)}</div></td>
                    <td>{r.adults} ad{r.children ? ` · ${r.children} ch` : ''}</td>
                    <td>{money2(r.total)}<div className="muted small">incl. {money2(r.fee)} charge</div></td>
                    <td style={{ whiteSpace: 'normal', minWidth: 160, maxWidth: 260 }} className="small">{r.notes ?? <span className="muted">None</span>}</td>
                    <td className="small">
                      <b>{payLabel[r.payment_status] ?? r.payment_status}</b>
                      <div className="muted">{r.payment_method ?? 'No method'}{r.promo_code ? ` · ${r.promo_code}` : ''}</div>
                      {receiptUrls[r.id] && <a className="link" href={receiptUrls[r.id]} target="_blank" rel="noreferrer">View receipt</a>}
                      {r.payment_status !== 'paid' && r.status !== 'cancelled' && (
                        <form action={setPaymentStatus} style={{ marginTop: 6 }}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="payment_status" value="paid" />
                          <button className="btn btn-ghost btn-sm" type="submit" style={{ height: 30 }}>Mark paid</button>
                        </form>
                      )}
                    </td>
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

        {/* ---------- Payments and charges ---------- */}
        <h2 style={{ fontSize: '1.5rem', marginTop: 48 }} id="payments">Payment methods</h2>
        <p className="muted small">Guests choose one of the active methods on the Pay step, then see these details on their booking page and upload a receipt. Add account names, numbers and any instructions.</p>
        <div className="grid-2">
          {((methods ?? []) as { id: number; name: string; summary: string; details: string; active: boolean; sort: number }[]).map((m) => (
            <form key={m.id} action={savePaymentMethod} className="panel form">
              <input type="hidden" name="id" value={m.id} />
              <div className="row">
                <div className="field"><label>Name</label><input name="name" defaultValue={m.name} required /></div>
                <div className="field"><label>Order</label><input name="sort" type="number" defaultValue={m.sort} /></div>
              </div>
              <div className="field"><label>Short line under the name</label><input name="summary" defaultValue={m.summary} /></div>
              <div className="field"><label>Payment details shown to the guest</label><textarea name="details" defaultValue={m.details} placeholder={'e.g.\nGCash number: 09xx xxx xxxx\nAccount name: La Luz Beach Resort'} /></div>
              <label className="check"><input type="checkbox" name="active" defaultChecked={m.active} /> Show this method to guests</label>
              <button className="btn btn-primary btn-sm" type="submit">Save</button>
            </form>
          ))}
          <form action={savePaymentMethod} className="panel form">
            <b>Add a payment method</b>
            <div className="field"><label>Name</label><input name="name" placeholder="e.g. Maya" required /></div>
            <div className="field"><label>Payment details shown to the guest</label><textarea name="details" /></div>
            <input type="hidden" name="active" value="on" />
            <button className="btn btn-ghost btn-sm" type="submit">Add method</button>
          </form>
        </div>

        <div className="grid-2" style={{ marginTop: 32 }}>
          <form action={saveCharges} className="panel form">
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Charges</h2>
            <p className="muted small" style={{ margin: 0 }}>Added on top of the room price. Applies to new bookings.</p>
            <div className="row">
              <div className="field"><label>VAT (%)</label><input name="vat" type="number" step="0.01" min="0" max="50" defaultValue={Number(settings?.vat_percent ?? 1)} /></div>
              <div className="field"><label>Service charge (%)</label><input name="service" type="number" step="0.01" min="0" max="50" defaultValue={Number(settings?.service_percent ?? 1)} /></div>
            </div>
            <button className="btn btn-primary btn-sm" type="submit">Save charges</button>
          </form>
          <div className="panel">
            <h2 style={{ fontSize: '1.3rem' }}>Promo codes</h2>
            <form action={savePromo} className="form">
              <div className="row">
                <div className="field"><label>Code</label><input name="code" placeholder="SUMMER10" required /></div>
                <div className="field"><label>% off room price</label><input name="percent" type="number" step="0.01" min="1" max="100" required /></div>
              </div>
              <div className="row">
                <div className="field"><label>Valid from</label><input name="from" type="date" /></div>
                <div className="field"><label>Valid to</label><input name="to" type="date" /></div>
              </div>
              <button className="btn btn-ghost btn-sm" type="submit">Add or update code</button>
            </form>
            {((promos ?? []) as { code: string; percent_off: number; active: boolean; valid_from: string | null; valid_to: string | null }[]).map((p) => (
              <form key={p.code} action={togglePromo} className="summary-row" style={{ alignItems: 'center' }}>
                <span><b>{p.code}</b> · {Number(p.percent_off)}% off{p.valid_from || p.valid_to ? ` · ${p.valid_from ?? '…'} to ${p.valid_to ?? '…'}` : ''}{p.active ? '' : ' · off'}</span>
                <input type="hidden" name="code" value={p.code} />
                <input type="hidden" name="active" value={p.active ? 'false' : 'true'} />
                <button className="btn btn-ghost btn-sm" type="submit" style={{ height: 30 }}>{p.active ? 'Turn off' : 'Turn on'}</button>
              </form>
            ))}
          </div>
        </div>

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
