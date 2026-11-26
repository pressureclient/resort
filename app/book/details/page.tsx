import Link from 'next/link';
import { rooms as content } from '@/lib/content';
import { parseStay, stayQuery } from '@/lib/format';
import { getProfile, isConfigured, supabaseServer } from '@/lib/supabase/server';
import { SetupNotice, Steps } from '@/components/Bits';
import BookingWizard from '@/components/BookingWizard';

export const metadata = { title: 'Your details' };
type SP = Promise<Record<string, string | string[] | undefined>>;

export default async function Details({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const stay = parseStay(sp);
  const slug = typeof sp.room === 'string' ? sp.room : '';
  const c = content.find((r) => r.slug === slug);
  const back = `/book?${stayQuery(stay, { room: slug })}`;

  const wrap = (body: React.ReactNode) => (
    <section className="page-head"><div className="wrap">
      <span className="label">Reservations</span>
      <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)' }}>Book Your Stay</h1>
      {body}
    </div></section>
  );

  if (!isConfigured) return wrap(<><Steps current={3} /><SetupNotice /></>);

  const sb = await supabaseServer();
  const [{ data }, { data: settings }, { data: methods }, profile] = await Promise.all([
    sb.rpc('room_availability', { p_in: stay.checkIn, p_out: stay.checkOut, p_guests: 1, p_rooms: stay.rooms }),
    sb.from('settings').select('vat_percent, service_percent').maybeSingle(),
    sb.from('payment_methods').select('id, name, summary').eq('active', true).order('sort'),
    getProfile(),
  ]);
  const room = ((data as { id: number; slug: string; name: string; capacity: number; units_left: number; subtotal: number; vat: number; service_charge: number; total: number }[]) ?? []).find((r) => r.slug === slug);
  const [firstName, ...rest] = (profile.fullName ?? '').split(' ');

  if (!room || !c) return wrap(<div className="empty">That room was not found. <Link className="link" href="/book">Start again</Link></div>);
  if (stay.guests > room.capacity * stay.rooms) {
    return wrap(<p className="msg err">{stay.rooms} {room.name} {stay.rooms === 1 ? 'room sleeps' : 'rooms sleep'} up to {room.capacity * stay.rooms} guests. <Link className="link" href={back}>Change room or guests</Link></p>);
  }
  if (room.units_left < stay.rooms) {
    return wrap(<p className="msg err">There {room.units_left === 1 ? 'is' : 'are'} only {room.units_left} {room.name} left for these dates. <Link className="link" href={back}>See other rooms</Link></p>);
  }

  return wrap(
    <BookingWizard
      stay={stay}
      room={{ id: room.id, slug: room.slug, name: room.name, type: c.type, beds: c.beds, image: c.images[0] }}
      quote={{ subtotal: +room.subtotal, discount: 0, vat: +room.vat, service_charge: +room.service_charge, total: +room.total, promo_valid: false }}
      vatPercent={Number(settings?.vat_percent ?? 1)}
      servicePercent={Number(settings?.service_percent ?? 1)}
      methods={(methods as { id: number; name: string; summary: string }[]) ?? []}
      backHref={back}
      prefill={{ firstName: firstName ?? '', lastName: rest.join(' '), email: profile.user?.email ?? '' }}
    />
  );
}
