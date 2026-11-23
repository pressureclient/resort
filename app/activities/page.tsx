import Link from 'next/link';
import { activities, images } from '@/lib/content';
import { PageHead, Pic } from '@/components/Bits';

export const metadata = { title: 'Activities' };

export default function Activities() {
  return (
    <>
      <PageHead photo={images.location} title="Activities" lead="Everything leaves from our jetty, with gear, life jackets and a guide when you want one." />
      <section className="section">
        <div className="wrap">
          {activities.map((a) => (
            <div className="act-row" id={a.id} key={a.id}>
              <Pic src={a.image} label={a.name} />
              <div>
                <h2 className="title" style={{ fontSize: '2.2rem' }}>{a.name}</h2>
                <p className="lead">{a.blurb}</p>
                <p className="muted">{a.detail}</p>
                <Link href="/contact" className="link">Ask about times and prices</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
