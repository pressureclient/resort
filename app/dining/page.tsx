import { dining, menu } from '@/lib/content';
import { money } from '@/lib/format';
import { PageHead, Pic } from '@/components/Bits';

export const metadata = { title: 'Dining and menu' };

export default function Dining() {
  return (
    <>
      <PageHead title="Dining" lead="Five places to eat and drink, open to staying guests and day visitors." />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap dine">
          {dining.map((d) => (
            <div className="venue" key={d.name}>
              <Pic src={d.image} />
              <div className="t"><span className="kind">{d.kind}</span><h3>{d.name}</h3><p>{d.text}</p><p className="small"><b>{d.hours}</b></p></div>
            </div>
          ))}
        </div>
      </section>
      <section className="section mist">
        <div className="wrap" style={{ maxWidth: 860 }}>
          <span className="label">Driftwood Grill</span>
          <h2 className="title" style={{ marginBottom: 32 }}>Menu</h2>
          {menu.map((s) => (
            <div className="menu-sec" key={s.section}>
              <h3 style={{ fontSize: '1.5rem' }}>{s.section}</h3>
              {s.items.map((i) => (
                <div className="menu-item" key={i.name}>
                  <div><b>{i.name}</b><div className="muted small">{i.desc}</div></div>
                  <span className="p">{money(i.price)}</span>
                </div>
              ))}
            </div>
          ))}
          <p className="small muted">Sample menu and prices. Replace with the resort&rsquo;s own.</p>
        </div>
      </section>
    </>
  );
}
