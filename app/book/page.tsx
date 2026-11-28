import Link from 'next/link';
import { rooms as content } from '@/lib/content';
import { money2, parseStay, prettyDate, stayQuery, today } from '@/lib/format';
import { isConfigured, supabaseServer } from '@/lib/supabase/server';
import { Pic, SetupNotice, StaySearch, Steps } from '@/components/Bits';
import { Bed, Users } from '@/components/Icons';

export const metadata = { title: 'Book Your Stay' };

type Avail = {
  id: number; slug: string; name: string; price_per_night: number; weekend_price: number | null;
  capacity: number; units: number; units_left: number | null; subtotal: number; vat: number; service_charge: number; total: number;
};
type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function Book({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const stay = parseStay(sp);
  const focus = typeof sp.room === 'string' ? sp.room : undefined;
  const searched = typeof sp.in === 'string';

  let list: Avail[] = [];
  let error: string | null = null;
  if (isConfigured && searched) {
    const sb = await supabaseServer();
    const { data, error: e } = await sb.rpc('room_availability', { p_in: stay.checkIn, p_out: stay.checkOut, p_guests: stay.guests, p_rooms: stay.rooms });
    if (e) error = 'We could not load availability. Please try again in a moment.';
    list = ((data as Avail[]) ?? []).map((r) => ({ ...r, subtotal: Number(r.subtotal), total: Number(r.total) }));
  }
  if (focus) list = [...list].sort((a, b) => Number(b.slug === focus) - Number(a.slug === focus));
  const hidden = searched ? content.filter((r) => r.capacity * stay.rooms < stay.guests).length : 0;
  const next = (slug: string) => `/book/details?${stayQuery(stay, { room: slug })}`;
  const guestsLine = `${stay.adults} ${stay.adults === 1 ? 'adult' : 'adults'}${stay.children ? `, ${stay.children} ${stay.children === 1 ? 'child' : 'children'}` : ''}`;

  return (
    <section className="page-head">
      <div className="wrap">
        <span className="label">Reservations</span>
        <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>Book Your Stay</h1>
        <Steps current={searched ? 2 : 1} />
        {!isConfigured && <SetupNotice />}

        <div className="panel" style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: 4 }}>Select Your Dates</h2>
          <p className="muted small" style={{ marginBottom: 16 }}>Choose your check-in and check-out, guests and number of rooms.</p>
          <StaySearch inline min={today()} checkIn={stay.checkIn} checkOut={stay.checkOut} adults={stay.adults} children={stay.children} rooms={stay.rooms} room={focus} />
        </div>

        {searched && (
          <>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 4 }}>Choose Your Room</h2>
            <p className="muted" style={{ marginBottom: 20 }}>
              {prettyDate(stay.checkIn)} → {prettyDate(stay.checkOut)} · {stay.nights} {stay.nights === 1 ? 'night' : 'nights'} · {guestsLine} · {stay.rooms} {stay.rooms === 1 ? 'room' : 'rooms'}
            </p>
            {error && <p className="msg err">{error}</p>}
            {list.length === 0 && !error && isConfigured && (
              <div className="empty">No rooms fit {stay.guests} guests in {stay.rooms} {stay.rooms === 1 ? 'room' : 'rooms'}. Try adding a room, or <Link className="link" href="/contact">ask us about a group stay</Link>.</div>
            )}
            {list.map((r) => {
              const c = content.find((x) => x.slug === r.slug);
              const left = r.units_left;
              const soldOut = left !== null && left < stay.rooms;
              return (
                <article key={r.slug} className={`avail${r.slug === focus ? ' hl-room' : ''}`}>
                  <Pic src={c?.images[0] ?? ''} />
                  <div className="body">
                    {c && <span className="type">{c.type}</span>}
                    <h3>{r.name}</h3>
                    <div className="specs"><span><Users /> Up to {r.capacity} per room</span>{c && <span><Bed /> {c.beds}</span>}</div>
                    <p className="muted small" style={{ margin: '0 0 10px' }}>{c?.summary}</p>
                    {soldOut ? (
                      <span className="left-badge none">{left && left > 0 ? `Only ${left} left for these dates` : 'Fully booked for these dates'}</span>
                    ) : (
                      <span className="left-badge">Available</span>
                    )}
                  </div>
                  <div className="right">
                    <span className="total">{money2(r.total)}</span>
                    <span className="muted small">{money2(r.subtotal / (stay.nights * stay.rooms))} / night{stay.rooms > 1 ? ' per room' : ''}</span>
                    <span className="muted small">incl. VAT &amp; service charge</span>
                    <span className="muted small">Breakfast, lunch &amp; dinner included</span>
                    {soldOut ? (
                      <span className="btn btn-ghost btn-sm" aria-disabled>Unavailable</span>
                    ) : (
                      <Link href={next(r.slug)} className="btn btn-primary btn-sm">Select &amp; continue</Link>
                    )}
                  </div>
                </article>
              );
            })}
            {hidden > 0 && <p className="small muted">{hidden} room {hidden === 1 ? 'type is' : 'types are'} hidden because {stay.rooms === 1 ? 'it sleeps' : `${stay.rooms} of them sleep`} fewer than {stay.guests}.</p>}
          </>
        )}
      </div>
    </section>
  );
}
