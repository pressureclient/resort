import Link from 'next/link';
import { notFound } from 'next/navigation';
import { rooms } from '@/lib/content';
import { addDays, money, today } from '@/lib/format';
import { Pic, RoomCard, StaySearch } from '@/components/Bits';
import { Bed, Check, Ruler, Users } from '@/components/Icons';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return rooms.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const room = rooms.find((r) => r.slug === slug);
  return { title: room?.name ?? 'Room' };
}

export default async function RoomPage({ params }: Props) {
  const { slug } = await params;
  const room = rooms.find((r) => r.slug === slug);
  if (!room) notFound();
  const t = today();
  const others = rooms.filter((r) => r.slug !== slug).slice(0, 3);

  return (
    <>
      <section className="page-head" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <div className="crumbs"><Link href="/rooms">Rooms</Link><span>/</span><span>{room.name}</span></div>
          <h1>{room.name}</h1>
          <div className="specs" style={{ fontSize: '0.95rem' }}>
            <span><Users /> Up to {room.capacity} guests</span>
            <span><Bed /> {room.beds}</span>
            <span><Ruler /> {room.size} m²</span>
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <div className="room-gallery">
            {room.images.map((src, i) => <Pic key={i} src={src} label={`${room.name} photo ${i + 1}`} />)}
          </div>
          <div className="room-detail">
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>About this room</h2>
              <p className="lead">{room.description}</p>
              <h3 style={{ fontSize: '1.3rem', marginTop: 32 }}>In the room</h3>
              <ul className="amenities">
                {room.amenities.map((a) => <li key={a}><Check /> {a}</li>)}
              </ul>
            </div>
            <aside className="panel sticky">
              <p style={{ margin: 0 }}><span style={{ fontFamily: 'var(--display)', fontSize: '2rem' }}>{money(room.price)}</span> <span className="muted">/ night</span></p>
              <p className="muted small">Breakfast for two included. Pay at the resort.</p>
              <div style={{ display: 'grid', gap: 12 }}>
                <StaySearch inline room={room.slug} min={t} checkIn={addDays(t, 1)} checkOut={addDays(t, 3)} guests={Math.min(2, room.capacity)} />
              </div>
            </aside>
          </div>
        </div>
      </section>
      <section className="section mist">
        <div className="wrap">
          <h2 className="title" style={{ marginBottom: 32 }}>Other rooms</h2>
          <div className="grid-3">{others.map((r) => <RoomCard key={r.slug} room={r} />)}</div>
        </div>
      </section>
    </>
  );
}
