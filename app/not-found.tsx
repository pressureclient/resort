import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="page-head">
      <div className="wrap" style={{ maxWidth: 640, textAlign: 'center' }}>
        <span className="label">404</span>
        <h1>Page not found</h1>
        <p className="lead" style={{ margin: '0 auto 28px' }}>The link may be old or mistyped. Try one of these instead.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary">Home</Link>
          <Link href="/rooms" className="btn btn-ghost">Rooms</Link>
          <Link href="/book" className="btn btn-ghost">Book your stay</Link>
        </div>
      </div>
    </section>
  );
}
