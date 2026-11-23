import { gallery } from '@/lib/content';
import { PageHead, bg } from '@/components/Bits';

export const metadata = { title: 'Gallery' };
const heights = [320, 420, 280, 380, 300, 440, 340, 260, 400, 300, 360, 420];

export default function Gallery() {
  return (
    <>
      <PageHead title="Gallery" lead="The beach, the rooms and the long evenings in between." />
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap masonry">
          {gallery.map((src, i) => (
            <div key={i} className="ph" style={{ ...bg(src), height: heights[i % heights.length] }} role="img" aria-label={`Resort photo ${i + 1}`} />
          ))}
        </div>
      </section>
    </>
  );
}
