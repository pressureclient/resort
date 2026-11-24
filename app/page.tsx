import Link from 'next/link';
import { site, mapEmbed, mapLink } from '@/lib/site';
import { activities, arrival, dining, highlights, images, reviews, rooms } from '@/lib/content';
import { addDays, today } from '@/lib/format';
import { Pic, RoomCard, StaySearch, bg } from '@/components/Bits';
import { ContactForm } from '@/components/Forms';
import { Arrow, Check, Pin, Star, highlightIcon } from '@/components/Icons';

export default function Home() {
  const t = today();
  const featured = rooms.filter((r) => r.featured);
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          {images.heroSlides.map((src) => <div key={src} className="hero-slide ph" style={bg(src)} />)}
        </div>
        <div className="hero-inner wrap">
          <p className="eyebrow">{site.tagline}</p>
          <h1>{site.fullName}</h1>
          <p className="sub">A Hidden Gem on the Shores of Batangas</p>
          <div className="ctas">
            <Link href="/book" className="btn btn-primary">Book your stay</Link>
            <Link href="/rooms" className="btn btn-glass">Explore rooms</Link>
          </div>
        </div>
        <div className="search-band">
          <div className="wrap">
            <StaySearch min={t} checkIn={addDays(t, 1)} checkOut={addDays(t, 3)} />
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="section tight">
        <div className="wrap highlights">
          {highlights.map((h) => {
            const Icon = highlightIcon[h.icon];
            return (
              <div className="hl" key={h.title}>
                <div className="ic"><Icon size={22} /></div>
                <h3>{h.title}</h3>
                <p>{h.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* About */}
      <section className="section" id="about" style={{ paddingTop: 32 }}>
        <div className="wrap split">
          <div>
            <span className="label">About us</span>
            <h2 className="title">Your Retreat for Relaxation &amp; Recreation</h2>
            <p className="lead">A small resort on a property that has been privately owned for over 30 years and was recently opened to the public. The resort was only meant to be a hideaway for a family of 13 children, hence the many rooms and a large pavilion.</p>
            <Link href="/about" className="btn btn-ghost" style={{ marginTop: 12 }}>Learn more</Link>
          </div>
          <Pic src={images.about} className="pic" label="La Luz Beach Resort" />
        </div>
      </section>

      {/* Rooms */}
      <section className="section mist" id="rooms">
        <div className="wrap">
          <div className="head">
            <div>
              <span className="label">Time to recharge</span>
              <h2 className="title">Our Accommodations</h2>
              <p className="lead">Each space is thoughtfully designed to blend tropical comfort with the calm of the bay.</p>
            </div>
            <Link href="/rooms" className="btn btn-ghost">See all rooms</Link>
          </div>
          <div className="grid-3">
            {featured.map((r) => <RoomCard key={r.slug} room={r} />)}
          </div>
        </div>
      </section>

      {/* Activities */}
      <section className="section" id="activities">
        <div className="wrap">
          <div className="head">
            <div>
              <span className="label">Experiences</span>
              <h2 className="title">Activities</h2>
              <p className="lead">La Luz Beach Resort offers adventures that will give unforgettable experiences.</p>
            </div>
            <Link href="/activities" className="btn btn-ghost">All activities</Link>
          </div>
          <div className="acts five">
            {activities.filter((a) => !a.pageOnly).map((a) => (
              <Link href={`/activities#${a.id}`} className="act" key={a.id}>
                <Pic src={a.image} />
                <div className="t"><h3>{a.name}</h3><p>{a.blurb}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pool */}
      <section className="section mist">
        <div className="wrap split flip">
          <Pic src={images.pool} className="pic wide" label="Swimming pool" />
          <div>
            <span className="label">Relax</span>
            <h2 className="title">Swimming Pool</h2>
            <p className="lead">Choose your preference of swimming in a pool or in the open sea.</p>
            <Link href="/book" className="btn btn-primary" style={{ marginTop: 12 }}>Book now</Link>
          </div>
        </div>
      </section>

      {/* Dining */}
      <section className="section" id="dining">
        <div className="wrap">
          <div className="head">
            <div>
              <span className="label">Fresh &amp; tasty</span>
              <h2 className="title">Restaurant and Bar</h2>
              <p className="lead">Delicious food from breakfast to dinner and a bar to unwind after a day of activities. Fresh seafood, Filipino classics and refreshing drinks await.</p>
            </div>
            <Link href="/dining" className="btn btn-ghost">See dining</Link>
          </div>
          <div className="dine">
            {dining.map((d) => (
              <div className="venue" key={d.name}>
                <Pic src={d.image} label={d.name} />
                <div className="t">
                  <span className="kind">{d.kind}</span>
                  <h3>{d.name}</h3>
                  <p>{d.short}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section mist">
        <div className="wrap">
          <div className="head">
            <div>
              <span className="label">What guests say</span>
              <h2 className="title">Testimonials</h2>
            </div>
          </div>
          <div className="grid-3">
            {reviews.map((r) => (
              <figure className="review" key={r.name} style={{ margin: 0 }}>
                <div className="stars" aria-label="5 out of 5">{[0, 1, 2, 3, 4].map((i) => <Star key={i} />)}</div>
                <blockquote>{r.text}</blockquote>
                <figcaption className="who">
                  <span className="avatar">{r.name[0]}</span>
                  <span><b>{r.name}</b><span>{r.room} · {r.date}</span></span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Arrival + book online */}
      <section className="section">
        <div className="wrap split" style={{ alignItems: 'stretch' }}>
          <div className="panel">
            <span className="label">Before you arrive</span>
            <h2 style={{ fontSize: '1.9rem' }}>Arrival and Registration</h2>
            <ul className="ticks" style={{ marginBottom: 0 }}>
              {arrival.map((a) => <li key={a}><Check /> {a}</li>)}
            </ul>
          </div>
          <div className="band" style={{ gridTemplateColumns: '1fr' }}>
            <div>
              <h2>Book Online Today</h2>
              <p>Reserve your beachfront stay directly with us for the best rates and availability. For enquiries, contact us at {site.email}.</p>
            </div>
            <div className="ctas">
              <Link href="/book" className="btn btn-light">Book online now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Location and contact */}
      <section className="section mist" id="contact">
        <div className="wrap split" style={{ alignItems: 'stretch' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <span className="label">Our location</span>
              <h2 className="title">Laiya, San Juan, Batangas</h2>
              <p className="lead">Located on the shores of Laiya, San Juan, Batangas, La Luz Beach Resort is just 3 to 4 hours from Metro Manila. Enjoy the white sand beach and crystal clear waters, perfect for a quick getaway.</p>
              <p style={{ display: 'flex', gap: 8 }}><Pin /> {site.address}</p>
              <a href={mapLink} target="_blank" rel="noreferrer" className="link">Get directions <Arrow /></a>
            </div>
            <iframe className="map" src={mapEmbed} title="Map to La Luz Beach Resort" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
          <div className="contact-card">
            <h2 style={{ fontSize: '1.9rem' }}>Get In Touch</h2>
            <p className="muted">Plan your stay with us.</p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
