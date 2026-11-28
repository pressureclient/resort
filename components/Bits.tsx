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
          {room.size && <span><Ruler /> {room.size} m²</span>}
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

export function StaySearch({ checkIn, checkOut, adults = 2, children = 0, rooms = 1, room, inline = false, min }: {
  checkIn?: string; checkOut?: string; adults?: number; children?: number; rooms?: number; room?: string; inline?: boolean; min: string;
}) {
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => i + from);
  return (
    <form action="/book" method="get" className={`search wide${inline ? ' inline' : ''}`}>
      {room && <input type="hidden" name="room" value={room} />}
      <div className="field"><label htmlFor="s-in">Check-in</label><input id="s-in" name="in" type="date" min={min} defaultValue={checkIn} required /></div>
      <div className="field"><label htmlFor="s-out">Check-out</label><input id="s-out" name="out" type="date" min={min} defaultValue={checkOut} required /></div>
      <div className="field">
        <label htmlFor="s-a">Adults</label>
        <select id="s-a" name="adults" defaultValue={adults}>{range(1, 45).map((n) => <option key={n} value={n}>{n}</option>)}</select>
      </div>
      <div className="field">
        <label htmlFor="s-c">Children</label>
        <select id="s-c" name="children" defaultValue={children}>{range(0, 20).map((n) => <option key={n} value={n}>{n}</option>)}</select>
      </div>
      <div className="field">
        <label htmlFor="s-r">Rooms</label>
        <select id="s-r" name="rooms" defaultValue={rooms}>{range(1, 5).map((n) => <option key={n} value={n}>{n} {n === 1 ? 'Room' : 'Rooms'}</option>)}</select>
      </div>
      <button className="btn btn-primary" type="submit">Search rooms <Arrow /></button>
    </form>
  );
}

/** 1 Dates · 2 Room · 3 Info · 4 Review · 5 Pay, as on the La Luz booking page. */
export function Steps({ current }: { current: 1 | 2 | 3 | 4 | 5 }) {
  const names = ['Dates', 'Room', 'Info', 'Review', 'Pay'];
  return (
    <ol className="steps5" aria-label="Booking steps">
      {names.map((n, i) => (
        <li key={n} className={i + 1 < current ? 'done' : i + 1 === current ? 'on' : ''} aria-current={i + 1 === current ? 'step' : undefined}>
          <span className="dot">{i + 1 < current ? '\u2713' : i + 1}</span><span className="nm">{n}</span>
        </li>
      ))}
    </ol>
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
