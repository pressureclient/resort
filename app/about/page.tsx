import Link from 'next/link';
import { about, images } from '@/lib/content';
import { PageHead, Pic } from '@/components/Bits';
import { Check } from '@/components/Icons';

export const metadata = { title: 'About' };

export default function About() {
  return (
    <>
      <PageHead photo={images.aboutPage} title="A Hidden Gem in Laiya" lead="Over 30 years of family heritage on the shores of Batangas." />
      <section className="section">
        <div className="wrap split">
          <div>
            <span className="label">Our story</span>
            <h2 className="title">Over 30 Years of Family Heritage</h2>
            {about.story.map((p, i) => <p key={i} className={i === 0 ? 'lead' : 'muted'}>{p}</p>)}
          </div>
          <Pic src={images.about} className="pic" label="La Luz Beach Resort grounds" />
        </div>
      </section>
      <section className="section mist">
        <div className="wrap">
          <span className="label">What we stand for</span>
          <h2 className="title">Our Values</h2>
          <div className="grid-3" style={{ marginTop: 32 }}>
            {about.values.map((v) => (
              <div className="hl" key={v.title}><div className="ic"><Check /></div><h3>{v.title}</h3><p>{v.text}</p></div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="stat-row">
            {about.stats.map((s) => <div key={s.k}><b>{s.v}</b><span>{s.k}</span></div>)}
          </div>
          <div className="photo-strip" style={{ marginTop: 32 }}>
            {about.photos.map((src, i) => <Pic key={i} src={src} label={`La Luz photo ${i + 1}`} />)}
          </div>
          <div className="band" style={{ marginTop: 48 }}>
            <div>
              <h2>Experience La Luz for Yourself</h2>
              <p>Book your stay and discover why guests keep coming back to Laiya&rsquo;s beachfront.</p>
            </div>
            <div className="ctas"><Link href="/book" className="btn btn-light">Book now</Link></div>
          </div>
        </div>
      </section>
    </>
  );
}
