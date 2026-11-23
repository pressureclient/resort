import Link from 'next/link';
import { faqs } from '@/lib/content';
import { PageHead } from '@/components/Bits';

export const metadata = { title: 'FAQ' };

export default function Faq() {
  return (
    <>
      <PageHead title="Questions guests ask" lead="Can't find your answer? Send us a message." />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap faq" style={{ maxWidth: 860 }}>
          {faqs.map((f) => (
            <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
          ))}
          <Link href="/contact" className="btn btn-primary" style={{ marginTop: 20 }}>Contact us</Link>
        </div>
      </section>
    </>
  );
}
