import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Room } from '@/lib/content';
import { money } from '@/lib/format';
import { Bed, Info, Ruler, Users, Arrow } from './Icons';

const fallback = 'linear-gradient(135deg, #9fb59f 0%, #dfe4d6 55%, #e8d9bb 100%)';

/** Background photo with a soft sea-to-sand gradient behind it, so nothing looks broken while it loads. */
export function bg(url: string): CSSProperties {
  return { backgroundImage: `url("${url}"), ${fallback}` };
}

export function Pic({ src, className = '', label }: { src: string; className?: string; label?: string }) {
  return <div className={`ph ${className}`} style={bg(src)} role={label ? 'img' : undefined} aria-label={label} />;
}

export function RoomCard({ room }: { room: Room }) {
  return (
    <article className="room">
      <Link href={`/rooms/${room.slug}`} className="pic ph" style={bg(room.images[0])} aria-label={room.name}>
        <span className="price-tag">{money(room.price)} <small>/ night</small></span>
      </Link>
      <div className="body">
        <span className="type">{room.type}</span>
        <h3>{room.name}</h3>
        <div className="specs">
          <span><Users /> Up to {room.capacity}</span>
          <span><Bed /> {room.beds}</span>
          <span><Ruler /> {room.size} m²</span>
        </div>
        <p className="muted small">{room.summary}</p>
        <div className="actions">
          <Link href={`/rooms/${room.slug}`} className="btn btn-ghost btn-sm">View room</Link>
          <Link href={`/book?room=${room.slug}`} className="btn btn-primary btn-sm">Book now</Link>
        </div>
      </div>
    </article>
  );
}

export function StaySearch({ checkIn, checkOut, guests, room, inline = false, min }: {
  checkIn?: string; checkOut?: string; guests?: number; room?: string; inline?: boolean; min: string;
}) {
  return (
    <form action="/book" method="get" className={`search${inline ? ' inline' : ''}`}>
      {room && <input type="hidden" name="room" value={room} />}
      <div className="field"><label htmlFor="s-in">Check-in</label><input id="s-in" name="in" type="date" min={min} defaultValue={checkIn} required /></div>
      <div className="field"><label htmlFor="s-out">Check-out</label><input id="s-out" name="out" type="date" min={min} defaultValue={checkOut} required /></div>
      <div className="field">
        <label htmlFor="s-g">Guests</label>
        <select id="s-g" name="guests" defaultValue={guests ?? 2}>
          {Array.from({ length: 25 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>)}
        </select>
      </div>
      <button className="btn btn-primary" type="submit">Check availability <Arrow /></button>
    </form>
  );
}

export function SetupNotice() {
  return (
    <div className="notice" role="note">
      <Info />
      <div>
        <b>Demo mode.</b> Bookings are not connected yet. Add your Supabase keys in <code>.env.local</code> and run{' '}
        <code>supabase/schema.sql</code> to take real bookings. See the README.
      </div>
    </div>
  );
}

export function PageHead({ title, lead, photo, crumbs }: { title: string; lead?: string; photo?: string; crumbs?: { href: string; label: string }[] }) {
  return (
    <section className={`page-head${photo ? ' photo' : ''}`}>
      {photo && <Pic src={photo} />}
      <div className="wrap">
        {crumbs && (
          <div className="crumbs" style={photo ? { color: 'rgba(255,255,255,.8)' } : undefined}>
            {crumbs.map((c, i) => (
              <span key={c.href} style={{ display: 'flex', gap: 8 }}>
                <Link href={c.href}>{c.label}</Link>{i < crumbs.length - 1 && <span>/</span>}
              </span>
            ))}
          </div>
        )}
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
      </div>
    </section>
  );
}
