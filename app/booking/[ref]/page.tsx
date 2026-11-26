import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isConfigured, supabaseServer } from '@/lib/supabase/server';
import { cancelBookingByToken, setPaymentMethod } from '@/lib/actions';
import { money2, prettyDate, today } from '@/lib/format';
import { site } from '@/lib/site';
import { Steps } from '@/components/Bits';
import { ReceiptForm, Submit } from '@/components/Forms';

export const metadata = { title: 'Your booking', robots: { index: false } };

type Props = { params: Promise<{ ref: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };
type B = {
  ref: string; status: string; room_name: string; room_slug: string; check_in: string; check_out: string;
  adults: number; children: number; rooms: number; guest_name: string; guest_email: string | null; phone: string | null;
  country: string | null; notes: string | null; subtotal: number; discount: number; promo_code: string | null;
  vat: number; service_charge: number; total: number; payment_method: string | null; payment_status: string;
  has_receipt: boolean; access_token: string;
};
type PM = { id: number; name: string; summary: string; details: string };

export default async function BookingPage({ params, searchParams }: Props) {
  const { ref } = await params;
  const sp = await searchParams;
  const token = typeof sp.t === 'string' ? sp.t : '';
  if (!isConfigured || !/^[0-9a-f-]{36}$/i.test(token)) notFound();

  const sb = await supabaseServer();
  const [{ data }, { data: settings }, { data: pms }] = await Promise.all([
    sb.rpc('get_booking', { p_ref: ref, p_token: token, p_email: null }),
    sb.from('settings').select('vat_percent, service_percent').maybeSingle(),
    sb.from('payment_methods').select('id, name, summary, details').eq('active', true).order('sort'),
  ]);
  const b = (data as B[] | null)?.[0];
  if (!b) notFound();
  const methods = (pms as PM[] | null) ?? [];
  const method = methods.find((m) => m.name === b.payment_method);

  const isNew = sp.new === '1';
  const askCancel = sp.cancel === '1';
  const link = `/booking/${b.ref}?t=${b.access_token}`;
  const live = b.status === 'pending' || b.status === 'confirmed';
  const canCancel = live && b.check_in > today();
  const needsPayment = live && b.payment_status === 'unpaid';
  const guests = `${b.adults} ${b.adults === 1 ? 'adult' : 'adults'}${b.children ? `, ${b.children} ${b.children === 1 ? 'child' : 'children'}` : ''}`;
  const payLabel = { unpaid: 'Awaiting payment', receipt_uploaded: 'Receipt received', paid: 'Paid' }[b.payment_status] ?? b.payment_status;

  return (
    <section className="page-head">
      <div className="wrap" style={{ maxWidth: 900 }}>
        {isNew && <Steps current={5} />}
        <span className="label">{isNew ? 'Booking created' : 'Your booking'}</span>
        <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>{isNew ? `Thank you, ${b.guest_name.split(' ')[0]}` : `Booking ${b.ref}`}</h1>
        {isNew && needsPayment && <p className="lead">Your booking is created. Complete your payment below and upload the receipt so our team can confirm it.</p>}
        {sp.uploaded === '1' && <p className="msg ok">Receipt received. Our team will check it and confirm your booking.</p>}
        <p style={{ margin: '18px 0' }}>
          <span className="ref-box">{b.ref}</span>
          <span className={`status ${b.status}`} style={{ marginLeft: 10 }}>{b.status}</span>
          <span className={`status ${b.payment_status === 'paid' ? 'confirmed' : 'pending'}`} style={{ marginLeft: 6 }}>{payLabel}</span>
        </p>

        {needsPayment && (
          <div className="panel" style={{ marginBottom: 20, borderColor: 'var(--sea)' }}>
            <span className="label">Payment</span>
            <h2 style={{ fontSize: '1.5rem' }}>Pay {money2(b.total)} by {b.payment_method ?? 'your chosen method'}</h2>
            {method?.details ? (
              <pre className="pay-details">{method.details}</pre>
            ) : (
              <p className="muted">Payment details for this method will be shared by our team. Questions? Email <a className="link" href={`mailto:${site.email}`}>{site.email}</a>.</p>
            )}
            <p className="small muted">Use your booking reference <b>{b.ref}</b> as the payment note, then upload a photo or screenshot of your receipt here.</p>
            <ReceiptForm bookingRef={b.ref} token={b.access_token} />
            {methods.length > 1 && b.status === 'pending' && (
              <form action={setPaymentMethod} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 16 }}>
                <input type="hidden" name="ref" value={b.ref} />
                <input type="hidden" name="token" value={b.access_token} />
                <span className="small muted">Pay another way:</span>
                <select name="method_id" defaultValue={method?.id} style={{ height: 38, border: '1px solid var(--line)', padding: '0 8px' }}>
                  {methods.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <Submit className="btn btn-ghost btn-sm">Switch</Submit>
              </form>
            )}
          </div>
        )}
        {live && b.payment_status === 'receipt_uploaded' && (
          <p className="msg ok" style={{ marginBottom: 20 }}>We have your {b.payment_method ?? ''} receipt. Our team will confirm your booking shortly.</p>
        )}

        <div className="panel">
          <div className="review-grid">
            <div className="summary-row"><span>Room</span><b>{b.rooms} × <Link className="link" href={`/rooms/${b.room_slug}`}>{b.room_name}</Link></b></div>
            <div className="summary-row"><span>Guests</span><b>{guests}</b></div>
            <div className="summary-row"><span>Check-in</span><b>{prettyDate(b.check_in)}, from {site.checkIn}</b></div>
            <div className="summary-row"><span>Check-out</span><b>{prettyDate(b.check_out)}, by {site.checkOut}</b></div>
            <div className="summary-row"><span>Guest</span><b>{b.guest_name}</b></div>
            <div className="summary-row"><span>Contact</span><b>{b.guest_email ?? '—'}{b.phone ? ` · ${b.phone}` : ''}</b></div>
          </div>
          {b.notes && <p className="small" style={{ marginTop: 12 }}><b>Special requests:</b> {b.notes}</p>}
          <div style={{ marginTop: 16, maxWidth: 440, marginLeft: 'auto' }}>
            <div className="summary-row"><span>Room subtotal</span><b>{money2(b.subtotal ?? b.total)}</b></div>
            {Number(b.discount) > 0 && <div className="summary-row"><span>Promo {b.promo_code}</span><b>−{money2(b.discount)}</b></div>}
            <div className="summary-row"><span>VAT ({Number(settings?.vat_percent ?? 1)}%)</span><b>{money2(b.vat ?? 0)}</b></div>
            <div className="summary-row"><span>Service charge ({Number(settings?.service_percent ?? 1)}%)</span><b>{money2(b.service_charge ?? 0)}</b></div>
            <div className="summary-row total"><span>Total</span><span>{money2(b.total)}</span></div>
          </div>
        </div>

        {canCancel && askCancel && (
          <div className="panel" style={{ marginTop: 20, borderColor: '#e6b3aa' }}>
            <h2 style={{ fontSize: '1.3rem' }}>Cancel booking {b.ref}?</h2>
            <p className="muted small">This releases the room for other guests and cannot be undone online. Free cancellation applies up to 48 hours before check-in; see the <Link className="link" href="/faq">FAQ</Link> for refunds.</p>
            <form action={cancelBookingByToken} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input type="hidden" name="ref" value={b.ref} />
              <input type="hidden" name="token" value={b.access_token} />
              <Submit className="btn btn-primary">Yes, cancel it</Submit>
              <Link href={link} className="btn btn-ghost">Keep my booking</Link>
            </form>
          </div>
        )}

        <div className="notice" style={{ marginTop: 20 }}>
          <div>
            <b>Save this page.</b> Bookmark it or copy the link to pay, view or cancel your booking later. You can also find it any time under{' '}
            <Link className="link" href="/account">My Bookings</Link> with your reference and email.
          </div>
        </div>

        <div className="wizard-actions">
          <Link href="/" className="btn btn-ghost">Back to home</Link>
          {canCancel && !askCancel && <Link href={`${link}&cancel=1`} className="btn btn-ghost">Cancel this booking</Link>}
        </div>
        <p className="small muted" style={{ marginTop: 16 }}>Questions? Email <a className="link" href={`mailto:${site.email}`}>{site.email}</a> or call {site.phone}.</p>
      </div>
    </section>
  );
}
