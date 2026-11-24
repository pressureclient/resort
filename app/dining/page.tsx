import { dining, images } from '@/lib/content';
import { PageHead, Pic } from '@/components/Bits';

export const metadata = { title: 'Dining & Bar' };

export default function Dining() {
  return (
    <>
      <PageHead photo={images.dining} title="Dining & Bar" lead="Fresh seafood, Filipino classics and refreshing drinks, from breakfast to late at night." />
      <section className="section">
        <div className="wrap">
          {dining.map((d) => (
            <div className="venue-row" key={d.name}>
              <Pic src={d.image} label={d.name} />
              <div>
                <span className="label">{d.kind}</span>
                <h2 className="title" style={{ fontSize: '2.2rem' }}>{d.name}</h2>
                <p className="lead">{d.text}</p>
                <div className="act-meta">
                  {d.hours && <span><b>{d.hours}</b></span>}
                  {d.seats && <span>Seats {d.seats}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
