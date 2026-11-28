import { images, rooms } from '@/lib/content';
import { PageHead, RoomCard, StaySearch } from '@/components/Bits';
import { addDays, today } from '@/lib/format';

export const metadata = { title: 'Rooms' };

export default function Rooms() {
  const t = today();
  return (
    <>
      <PageHead photo={images.rooms} title="Our Accommodations" lead="Rooms, lofts, dormitories and private pool villas, from couples to groups of 45. Prices are per night, already 50% off, with breakfast, lunch and dinner included." />
      <section className="section">
        <div className="wrap">
          <div style={{ marginBottom: 32 }}><StaySearch inline min={t} checkIn={addDays(t, 1)} checkOut={addDays(t, 3)} /></div>
          <div className="grid-3">
            {rooms.map((r) => <RoomCard key={r.slug} room={r} />)}
          </div>
        </div>
      </section>
    </>
  );
}
