import { rooms } from '@/lib/content';
import { PageHead, RoomCard, StaySearch } from '@/components/Bits';
import { addDays, today } from '@/lib/format';

export const metadata = { title: 'Rooms' };

export default function Rooms() {
  const t = today();
  return (
    <>
      <PageHead title="Rooms and suites" lead="Four ways to stay, all within two minutes of the beach. Prices are per night with breakfast for two." />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div style={{ marginBottom: 32 }}><StaySearch inline min={t} checkIn={addDays(t, 1)} checkOut={addDays(t, 3)} /></div>
          <div className="grid-2">
            {rooms.map((r) => <RoomCard key={r.slug} room={r} />)}
          </div>
        </div>
      </section>
    </>
  );
}
