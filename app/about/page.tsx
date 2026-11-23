import Link from 'next/link';
import { images } from '@/lib/content';
import { site } from '@/lib/site';
import { PageHead, Pic } from '@/components/Bits';
import { Check } from '@/components/Icons';

export const metadata = { title: 'About' };

export default function About() {
  return (
    <>
      <PageHead photo={images.about} title="Our story" lead={`How a family beach house became ${site.fullName}.`} />
      <section className="section">
        <div className="wrap split">
          <div>
            <span className="label">Where it started</span>
            <h2 className="title">Built for slow weekends</h2>
            <p className="lead">The cove was a family retreat long before it had a name. Weekends meant fresh fish on the grill, kids in the shallows and nobody checking the time.</p>
            <p className="muted">When we opened the gates to guests, we kept it small on purpose. A handful of room types, a beach that never feels crowded and a team that treats every arrival like a returning friend.</p>
          </div>
          <Pic src={images.location} className="pic" label="The bay at sunset" />
        </div>
      </section>
      <section className="section mist">
        <div className="wrap">
          <span className="label">What we care about</span>
          <h2 className="title">Three things we will not change</h2>
          <div className="grid-3" style={{ marginTop: 32 }}>
            {[
              ['A quiet beach', 'We cap guest numbers so there is always space on the sand.'],
              ['Local food', 'Fish comes from boats in the bay and produce from nearby farms.'],
              ['Honest prices', 'The rate you see online is the rate you pay, with breakfast for two included.'],
            ].map(([t, d]) => (
              <div className="hl" key={t}><div className="ic"><Check /></div><h3>{t}</h3><p>{d}</p></div>
            ))}
          </div>
          <div style={{ marginTop: 40 }}><Link href="/book" className="btn btn-primary">Plan your stay</Link></div>
        </div>
      </section>
    </>
  );
}
