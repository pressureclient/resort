import Link from 'next/link';
import { faqs } from '@/lib/content';
import { PageHead } from '@/components/Bits';

export const metadata = { title: 'FAQ' };

export default function Faq() {
  return (
    <>
      <PageHead title="Frequently Asked Questions" lead="Still have a question? Our reservations team is happy to help." />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap faq" style={{ maxWidth: 860 }}>
          {[...new Set(faqs.map((f) => f.group))].map((g) => (
            <div key={g} style={{ marginBottom: 28 }}>
              <span className="label">{g}</span>
              {faqs.filter((f) => f.group === g).map((f) => (
                <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
              ))}
            </div>
          ))}
          <Link href="/contact" className="btn btn-primary" style={{ marginTop: 20 }}>Contact us</Link>
        </div>
      </section>
    </>
  );
}
