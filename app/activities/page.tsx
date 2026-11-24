import Link from 'next/link';
import { activities, images } from '@/lib/content';
import { money } from '@/lib/format';
import { PageHead, Pic } from '@/components/Bits';

export const metadata = { title: 'Activities' };

export default function Activities() {
  return (
    <>
      <PageHead photo={images.activities} title="Activities & Experiences" lead="Calm mornings on a kayak, banana boat rides in the afternoon and bonfires at night." />
      <section className="section">
        <div className="wrap">
          {activities.map((a) => (
            <div className="act-row" id={a.id} key={a.id}>
              <Pic src={a.image} label={a.name} />
              <div>
                <h2 className="title" style={{ fontSize: '2.2rem' }}>{a.name}</h2>
                <div className="act-meta">
                  <span>From <b>{a.price === 0 ? 'Free' : money(a.price)}</b></span>
                  <span>{a.duration}</span>
                </div>
                <p className="lead">{a.blurb}</p>
                <Link href="/contact" className="btn btn-ghost btn-sm">Enquire</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="section mist">
        <div className="wrap split">
          <Pic src={images.activities2} className="pic wide" label="Guests enjoying the beach" />
          <div>
            <span className="label">Guest favourites</span>
            <h2 className="title">Why Guests Love Our Activities</h2>
            <p className="lead">From calm morning kayaking to thrilling banana boat rides in the afternoon, every hour at La Luz offers something memorable. Enjoy the ocean at your own pace: no pressure, no schedules, just coastal freedom.</p>
            <Link href="/book" className="btn btn-primary" style={{ marginTop: 12 }}>Book your stay</Link>
          </div>
        </div>
      </section>
    </>
  );
}
