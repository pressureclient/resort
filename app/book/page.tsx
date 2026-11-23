import Link from 'next/link';
import { rooms as content } from '@/lib/content';
import { money, parseStay, prettyDate, today } from '@/lib/format';
import { isConfigured, supabaseServer } from '@/lib/supabase/server';
import { Pic, SetupNotice, StaySearch } from '@/components/Bits';
import { Bed, Users } from '@/components/Icons';

export const metadata = { title: 'Book your stay' };

type Avail = { id: number; slug: string; name: string; price_per_night: number; capacity: number; units: number; units_left: number | null };
type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function Book({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const stay = parseStay(sp);
  const focus = typeof sp.room === 'string' ? sp.room : undefined;

  let list: Avail[] = [];
  let error: string | null = null;
  if (isConfigured) {
    const sb = await supabaseServer();
    const { data, error: e } = await sb.rpc('room_availability', { p_in: stay.checkIn, p_out: stay.checkOut, p_guests: stay.guests });
    if (e) error = 'We could not load availability. Please try again in a moment.';
    list = (data as Avail[]) ?? [];
  } else {
    list = content
      .filter((r) => r.capacity >= stay.guests)
      .map((r, i) => ({ id: i + 1, slug: r.slug, name: r.name, price_per_night: r.price, capacity: r.capacity, units: 0, units_left: null }));
  }
  if (focus) list = [...list].sort((a, b) => Number(b.slug === focus) - Number(a.slug === focus));
  const hidden = content.filter((r) => r.capacity < stay.guests).length;
  const qs = (slug: string) => `/book/confirm?room=${slug}&in=${stay.checkIn}&out=${stay.checkOut}&guests=${stay.guests}`;

  return (
    <section className="page-head">
      <div className="wrap">
        <div className="steps"><span className="on">1. Dates and room</span><span>2. Your details</span><span>3. Booked</span></div>
        <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>Book your stay</h1>
        {!isConfigured && <SetupNotice />}
        <div style={{ margin: '24px 0 32px' }}>
          <StaySearch inline min={today()} checkIn={stay.checkIn} checkOut={stay.checkOut} guests={stay.guests} room={focus} />
        </div>
        <p className="muted" style={{ marginBottom: 20 }}>
          {prettyDate(stay.checkIn)} to {prettyDate(stay.checkOut)} · {stay.nights} {stay.nights === 1 ? 'night' : 'nights'} · {stay.guests} {stay.guests === 1 ? 'guest' : 'guests'}
        </p>
        {error && <p className="msg err">{error}</p>}
        {list.length === 0 && !error && (
          <div className="empty">No rooms sleep {stay.guests} guests. Try fewer guests per room or <Link className="link" href="/contact">ask us about a group stay</Link>.</div>
        )}
        {list.map((r) => {
          const c = content.find((x) => x.slug === r.slug);
          const left = r.units_left;
          const soldOut = left !== null && left < 1;
          return (
            <article key={r.slug} className={`avail${r.slug === focus ? ' hl-room' : ''}`}>
              <Pic src={c?.images[0] ?? ''} />
              <div className="body">
                <h3>{r.name}</h3>
                <div className="specs"><span><Users /> Up to {r.capacity}</span>{c && <span><Bed /> {c.beds}</span>}</div>
                <p className="muted small" style={{ margin: '0 0 10px' }}>{c?.summary}</p>
                {left === null ? null : soldOut ? (
                  <span className="left-badge none">Fully booked for these dates</span>
                ) : (
                  <span className={`left-badge${left <= 2 ? ' low' : ''}`}>{left <= 2 ? `Only ${left} left` : 'Available'}</span>
                )}
              </div>
              <div className="right">
                <span className="muted small">{money(r.price_per_night)} × {stay.nights}</span>
                <span className="total">{money(r.price_per_night * stay.nights)}</span>
                {soldOut ? (
                  <span className="btn btn-ghost btn-sm" aria-disabled>Unavailable</span>
                ) : (
                  <Link href={qs(r.slug)} className="btn btn-primary btn-sm">Select room</Link>
                )}
              </div>
            </article>
          );
        })}
        {hidden > 0 && <p className="small muted">{hidden} room {hidden === 1 ? 'type is' : 'types are'} hidden because they sleep fewer than {stay.guests}.</p>}
      </div>
    </section>
  );
}
