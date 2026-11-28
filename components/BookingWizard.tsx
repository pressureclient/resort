'use client';

import Link from 'next/link';
import { useActionState, useState, useTransition } from 'react';
import { createBooking, getQuote, type Quote } from '@/lib/actions';
import { Steps, bg } from './Bits';
import { Submit } from './Forms';
import { money2, prettyDate } from '@/lib/format';
import { site } from '@/lib/site';

type Props = {
  stay: { checkIn: string; checkOut: string; adults: number; children: number; rooms: number; nights: number };
  room: { id: number; slug: string; name: string; type: string; beds: string; image: string };
  quote: Quote;
  vatPercent: number;
  servicePercent: number;
  methods: { id: number; name: string; summary: string }[];
  backHref: string;
  prefill: { firstName: string; lastName: string; email: string };
};

const POLICIES = [
  'Breakfast, lunch and dinner included',
  `Check-in: ${site.checkIn} onwards`,
  `Check-out: ${site.checkOut} noon`,
  'No smoking in rooms',
  'Pets not allowed',
  'Free cancellation 48hrs before',
];

export default function BookingWizard({ stay, room, quote: initialQuote, vatPercent, servicePercent, methods, backHref, prefill }: Props) {
  const [step, setStep] = useState<3 | 4 | 5>(3);
  const [info, setInfo] = useState({ first: prefill.firstName, last: prefill.lastName, email: prefill.email, phone: '', country: 'Philippines', notes: '' });
  const [infoError, setInfoError] = useState('');
  const [quote, setQuote] = useState<Quote>(initialQuote);
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState('');
  const [promoMsg, setPromoMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [checking, startCheck] = useTransition();
  const [method, setMethod] = useState<number>(methods[0]?.id ?? 0);
  const [state, action] = useActionState(createBooking, undefined);

  const set = (k: keyof typeof info) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setInfo({ ...info, [k]: e.target.value }); setInfoError(''); };
  const go = (s: 3 | 4 | 5) => { setStep(s); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const nightsLabel = `${stay.nights} ${stay.nights === 1 ? 'night' : 'nights'}`;
  const guests = `${stay.adults} ${stay.adults === 1 ? 'adult' : 'adults'}${stay.children ? `, ${stay.children} ${stay.children === 1 ? 'child' : 'children'}` : ''}`;

  const toReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!info.first.trim() || !info.last.trim()) return setInfoError('Please enter the guest’s first and last name.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(info.email.trim())) return setInfoError('Please enter a valid email address.');
    if (info.phone.replace(/\D/g, '').length < 7) return setInfoError('Please enter a valid phone number.');
    go(4);
  };

  const applyPromo = () => {
    const code = promoInput.trim();
    if (!code) return;
    startCheck(async () => {
      const q = await getQuote({ roomId: room.id, checkIn: stay.checkIn, checkOut: stay.checkOut, rooms: stay.rooms, promo: code });
      if (q && q.promo_valid) { setQuote(q); setPromo(code.toUpperCase()); setPromoMsg({ ok: true, text: `Promo ${code.toUpperCase()} applied.` }); }
      else { setPromoMsg({ ok: false, text: 'That promo code is not valid.' }); }
    });
  };
  const removePromo = () => { setQuote(initialQuote); setPromo(''); setPromoInput(''); setPromoMsg(null); };

  const Summary = (
    <aside className="panel sticky">
      <div className="ph" style={{ ...bg(room.image), aspectRatio: '16 / 10', marginBottom: 14 }} />
      <span className="type">{room.type}</span>
      <h3 style={{ fontSize: '1.4rem', marginTop: 4 }}>{room.name}</h3>
      <div className="summary-row"><span>Check-in</span><b>{prettyDate(stay.checkIn)}</b></div>
      <div className="summary-row"><span>Check-out</span><b>{prettyDate(stay.checkOut)}</b></div>
      <div className="summary-row"><span>Guests</span><b>{guests}</b></div>
      <div className="summary-row"><span>Rooms</span><b>{stay.rooms}</b></div>
      <div className="summary-row total"><span>Total</span><span>{money2(quote.total)}</span></div>
      <Link href={backHref} className="link small" style={{ marginTop: 12 }}>Change dates or room</Link>
    </aside>
  );

  return (
    <>
      <Steps current={step} />
      <div className="room-detail" style={{ marginTop: 0 }}>
        <div className="panel">
          {step === 3 && (
            <form onSubmit={toReview} className="form" noValidate>
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: 2 }}>Your Information</h2>
                <p className="muted small" style={{ margin: 0 }}>Tell us about the primary guest. No account needed.</p>
              </div>
              <div className="row">
                <div className="field"><label htmlFor="g-first">First name *</label><input id="g-first" value={info.first} onChange={set('first')} autoComplete="given-name" placeholder="John" required /></div>
                <div className="field"><label htmlFor="g-last">Last name *</label><input id="g-last" value={info.last} onChange={set('last')} autoComplete="family-name" placeholder="Doe" required /></div>
              </div>
              <div className="row">
                <div className="field"><label htmlFor="g-email">Email address *</label><input id="g-email" type="email" value={info.email} onChange={set('email')} autoComplete="email" placeholder="john@example.com" required /></div>
                <div className="field"><label htmlFor="g-phone">Phone *</label><input id="g-phone" type="tel" value={info.phone} onChange={set('phone')} autoComplete="tel" placeholder="+63 912 345 6789" required /></div>
              </div>
              <div className="field"><label htmlFor="g-country">Country</label><input id="g-country" value={info.country} onChange={set('country')} autoComplete="country-name" placeholder="Philippines" /></div>
              <div className="field"><label htmlFor="g-notes">Special requests</label><textarea id="g-notes" value={info.notes} onChange={set('notes')} maxLength={1000} placeholder="Early check-in, dietary requirements, anniversary setup…" /></div>
              {infoError && <p className="msg err" role="alert">{infoError}</p>}
              <div className="wizard-actions">
                <Link href={backHref} className="btn btn-ghost">← Back</Link>
                <button type="submit" className="btn btn-primary">Review booking →</button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 2 }}>Booking Summary</h2>
              <p className="muted small">Please review before payment.</p>
              <div className="panel" style={{ padding: 18, marginBottom: 16 }}>
                <span className="type">{room.type}</span>
                <h3 style={{ fontSize: '1.25rem', margin: '4px 0' }}>{room.name}</h3>
                <p className="muted small" style={{ margin: 0 }}>{room.beds} · {prettyDate(stay.checkIn)} → {prettyDate(stay.checkOut)} ({nightsLabel})</p>
              </div>
              <div className="summary-row"><span>Room subtotal ({stay.rooms} {stay.rooms === 1 ? 'room' : 'rooms'} × {nightsLabel})</span><b>{money2(quote.subtotal)}</b></div>
              {quote.discount > 0 && <div className="summary-row"><span>Promo {promo} <button type="button" className="link small" onClick={removePromo} style={{ background: 'none', border: 0, cursor: 'pointer', padding: 0 }}>Remove</button></span><b>−{money2(quote.discount)}</b></div>}
              <div className="summary-row"><span>VAT ({vatPercent}%)</span><b>{money2(quote.vat)}</b></div>
              <div className="summary-row"><span>Service charge ({servicePercent}%)</span><b>{money2(quote.service_charge)}</b></div>
              <div className="summary-row total"><span>Total</span><span>{money2(quote.total)}</span></div>
              {!promo && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <input className="input" style={{ height: 44 }} placeholder="Promo code" aria-label="Promo code" value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value); setPromoMsg(null); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyPromo(); } }} />
                  <button type="button" className="btn btn-ghost" style={{ height: 44 }} onClick={applyPromo} disabled={checking}>{checking ? '…' : 'Apply'}</button>
                </div>
              )}
              {promoMsg && <p className={`msg ${promoMsg.ok ? 'ok' : 'err'}`} style={{ marginTop: 10 }}>{promoMsg.text}</p>}

              <div className="review-grid" style={{ marginTop: 24 }}>
                <div>
                  <span className="label" style={{ marginBottom: 6 }}>Guest details</span>
                  <p style={{ margin: 0 }}><b>{info.first} {info.last}</b><br />{info.email}<br />{info.phone}{info.country ? <><br />{info.country}</> : null}</p>
                  {info.notes && <p className="small muted" style={{ marginTop: 8 }}>Requests: {info.notes}</p>}
                </div>
                <div>
                  <span className="label" style={{ marginBottom: 6 }}>Resort policies</span>
                  <ul className="ticks" style={{ margin: 0, gap: 4 }}>{POLICIES.map((p) => <li key={p} className="small">{p}</li>)}</ul>
                </div>
              </div>
              <div className="wizard-actions">
                <button type="button" className="btn btn-ghost" onClick={() => go(3)}>← Back</button>
                <button type="button" className="btn btn-primary" onClick={() => go(5)}>Proceed to payment →</button>
              </div>
            </div>
          )}

          {step === 5 && (
            <form action={action}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: 2 }}>Secure Payment</h2>
              <p className="muted small">How would you like to pay? Your booking is created first, then you pay on the next page.</p>
              {[
                ['room_id', room.id], ['in', stay.checkIn], ['out', stay.checkOut], ['adults', stay.adults], ['children', stay.children],
                ['rooms', stay.rooms], ['first_name', info.first], ['last_name', info.last], ['email', info.email], ['phone', info.phone],
                ['country', info.country], ['notes', info.notes], ['promo', promo], ['payment_method_id', method],
              ].map(([k, v]) => <input key={k as string} type="hidden" name={k as string} value={String(v)} />)}
              <div style={{ display: 'grid', gap: 10, marginTop: 8 }}>
                {methods.length === 0 && <p className="msg err">No payment methods are available right now. Please contact the resort.</p>}
                {methods.map((m) => (
                  <label key={m.id} className={`pay-option${method === m.id ? ' on' : ''}`}>
                    <input type="radio" name="pm_choice" checked={method === m.id} onChange={() => setMethod(m.id)} />
                    <span><b>{m.name}</b><br /><span className="muted small">{m.summary}</span></span>
                  </label>
                ))}
              </div>
              <div className="summary-row total" style={{ marginTop: 16 }}><span>Total amount due</span><span>{money2(quote.total)}</span></div>
              <p className="muted small" style={{ margin: '4px 0 0' }}>{nightsLabel} · {stay.rooms > 1 ? `${stay.rooms} × ` : ''}{room.name}</p>
              {state?.error && <p className="msg err" role="alert" style={{ marginTop: 14 }}>{state.error}</p>}
              <div className="wizard-actions">
                <button type="button" className="btn btn-ghost" onClick={() => go(4)}>← Back</button>
                <Submit>Confirm &amp; continue to payment</Submit>
              </div>
            </form>
          )}
        </div>
        {Summary}
      </div>
    </>
  );
}
