import Link from 'next/link';
import { redirect } from 'next/navigation';
import { rooms as content } from '@/lib/content';
import { money, parseStay, prettyDate } from '@/lib/format';
import { getProfile, isConfigured, supabaseServer } from '@/lib/supabase/server';
import { Pic, SetupNotice } from '@/components/Bits';
import { BookingForm } from '@/components/Forms';

export const metadata = { title: 'Confirm booking' };
type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function Confirm({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const stay = parseStay(sp);
  const slug = typeof sp.room === 'string' ? sp.room : '';
  const c = content.find((r) => r.slug === slug);
  const back = `/book?room=${slug}&in=${stay.checkIn}&out=${stay.checkOut}&guests=${stay.guests}`;
  const here = `/book/confirm?room=${slug}&in=${stay.checkIn}&out=${stay.checkOut}&guests=${stay.guests}`;

  let room: { id: number; name: string; price_per_night: number; capacity: number } | null = null;
  let left: number | null = null;
  let fullName = '';

  if (isConfigured) {
    const { user, fullName: fn } = await getProfile();
    if (!user) redirect(`/login?next=${encodeURIComponent(here)}`);
    fullName = fn ?? '';
    const sb = await supabaseServer();
    const { data } = await sb.from('rooms').select('id, name, price_per_night, capacity').eq('slug', slug).eq('active', true).maybeSingle();
    room = data;
    if (room) {
      const { data: u } = await sb.rpc('units_left', { p_room_id: room.id, p_in: stay.checkIn, p_out: stay.checkOut });
      left = typeof u === 'number' ? u : null;
    }
  } else if (c) {
    room = { id: 0, name: c.name, price_per_night: c.price, capacity: c.capacity };
  }

  if (!room) {
    return (
      <section className="page-head"><div className="wrap"><div className="empty">That room was not found. <Link className="link" href="/book">Back to booking</Link></div></div></section>
    );
  }

  const tooMany = stay.guests > room.capacity;
  const unavailable = left !== null && left < 1;

  return (
    <section className="page-head">
      <div className="wrap">
        <div className="steps"><span>1. Dates and room</span><span className="on">2. Your details</span><span>3. Booked</span></div>
        <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>Confirm your booking</h1>
        {!isConfigured && <SetupNotice />}
        <div className="room-detail" style={{ marginTop: 24 }}>
          <div className="panel">
            {tooMany ? (
              <p className="msg err">The {room.name} sleeps up to {room.capacity}. <Link className="link" href={back}>Change room or guests</Link></p>
            ) : unavailable ? (
              <p className="msg err">Someone just took the last {room.name} for these dates. <Link className="link" href={back}>See other rooms</Link></p>
            ) : isConfigured ? (
              <BookingForm roomId={room.id} checkIn={stay.checkIn} checkOut={stay.checkOut} guests={stay.guests} defaultName={fullName} />
            ) : (
              <p className="muted" style={{ margin: 0 }}>Guests sign in and fill in their name, phone and requests here. Connect Supabase to turn this step on.</p>
            )}
          </div>
          <aside className="panel sticky">
            {c && <Pic src={c.images[0]} className="" label={room.name} />}
            <h3 style={{ fontSize: '1.4rem', marginTop: 16 }}>{room.name}</h3>
            <div className="summary-row"><span>Check-in</span><b>{prettyDate(stay.checkIn)}</b></div>
            <div className="summary-row"><span>Check-out</span><b>{prettyDate(stay.checkOut)}</b></div>
            <div className="summary-row"><span>Guests</span><b>{stay.guests}</b></div>
            <div className="summary-row"><span>{money(room.price_per_night)} × {stay.nights} {stay.nights === 1 ? 'night' : 'nights'}</span><b>{money(room.price_per_night * stay.nights)}</b></div>
            <div className="summary-row total"><span>Total, paid at the resort</span><span>{money(room.price_per_night * stay.nights)}</span></div>
            <Link href={back} className="link small" style={{ marginTop: 12 }}>Change dates or room</Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
