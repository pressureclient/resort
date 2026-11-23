import Link from 'next/link';
import { site, mapEmbed, mapLink } from '@/lib/site';
import { activities, dining, highlights, images, reviews, rooms } from '@/lib/content';
import { addDays, today } from '@/lib/format';
import { Pic, RoomCard, StaySearch, bg } from '@/components/Bits';
import { ContactForm } from '@/components/Forms';
import { Arrow, Check, Pin, Star, highlightIcon } from '@/components/Icons';

export default function Home() {
  const t = today();
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg ph" style={bg(images.hero)} />
        <div className="hero-inner wrap">
          <h1>A quiet cove with the sea at your door</h1>
          <p className="sub">Beachfront rooms, a private stretch of sand and slow days by the water. Book online in a couple of minutes.</p>
          <div className="ctas">
            <Link href="/book" className="btn btn-light">Book your stay</Link>
            <Link href="/rooms" className="btn btn-glass">Explore rooms</Link>
          </div>
          <div className="facts">
            <div><b>4</b><span>room types</span></div>
            <div><b>400 m</b><span>private beach</span></div>
            <div><b>5</b><span>water activities</span></div>
            <div><b>{site.checkIn}</b><span>check-in</span></div>
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
          <Pic src={images.about} className="pic" label="Resort grounds by the beach" />
          <div>
            <span className="label">Time to recharge</span>
            <h2 className="title">A family hideaway, now open to guests</h2>
            <p className="lead">For years this cove was where one family came to switch off. We kept what made it special: the calm water, the shade of the palms and nowhere you need to be.</p>
            <ul className="ticks">
              <li><Check /> Rooms a short walk from the sand, never more than two minutes</li>
              <li><Check /> Pool, beach bar and restaurants on site</li>
              <li><Check /> Staff who know the bay and plan your days on the water</li>
            </ul>
            <Link href="/about" className="link">Our story <Arrow /></Link>
          </div>
        </div>
      </section>

      {/* Rooms */}
      <section className="section mist" id="rooms">
        <div className="wrap">
          <div className="head">
            <div>
              <span className="label">Accommodation</span>
              <h2 className="title">Rooms and suites</h2>
              <p className="lead">From a sea-facing room for two to a villa for six. Every price is per night and includes breakfast for two.</p>
            </div>
            <Link href="/rooms" className="btn btn-ghost">See all rooms</Link>
          </div>
          <div className="grid-3 rooms-4">
            {rooms.map((r) => <RoomCard key={r.slug} room={r} />)}
          </div>
        </div>
      </section>

      {/* Activities */}
      <section className="section" id="activities">
        <div className="wrap">
          <div className="head">
            <div>
              <span className="label">On the water</span>
              <h2 className="title">Things to do</h2>
              <p className="lead">Everything leaves from our jetty. Book at the beach desk on the day or add it to your booking notes.</p>
            </div>
            <Link href="/activities" className="btn btn-ghost">All activities</Link>
          </div>
          <div className="acts">
            {activities.map((a) => (
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
            <span className="label">Swimming pool</span>
            <h2 className="title">A pool for the hours between swims</h2>
            <p className="lead">Fresh water, loungers under umbrellas and drinks from the bar until sunset. Open to all guests and day-pass visitors from 8 AM to 7 PM.</p>
            <Link href="/book" className="btn btn-primary" style={{ marginTop: 12 }}>Book now</Link>
          </div>
        </div>
      </section>

      {/* Dining */}
      <section className="section" id="dining">
        <div className="wrap">
          <div className="head">
            <div>
              <span className="label">Eat and drink</span>
              <h2 className="title">Restaurants and bars</h2>
              <p className="lead">Five places to eat, from grilled fish on the sand to wood-fired pizza by the pool.</p>
            </div>
            <Link href="/dining" className="btn btn-ghost">See the menu</Link>
          </div>
          <div className="dine">
            {dining.map((d) => (
              <div className="venue" key={d.name}>
                <Pic src={d.image} />
                <div className="t">
                  <span className="kind">{d.kind}</span>
                  <h3>{d.name}</h3>
                  <p>{d.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="section mist">
        <div className="wrap">
          <div className="head">
            <div>
              <span className="label">Guest notes</span>
              <h2 className="title">What guests say</h2>
            </div>
          </div>
          <div className="grid-3">
            {reviews.map((r) => (
              <figure className="review" key={r.name} style={{ margin: 0 }}>
                <div className="stars">{[0, 1, 2, 3, 4].map((i) => <Star key={i} />)}</div>
                <blockquote>{r.text}</blockquote>
                <figcaption className="who">
                  <span className="avatar">{r.name[0]}</span>
                  <span><b>{r.name}</b><span>{r.room} · {r.date}</span></span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="sample-note">Sample reviews for this template. Replace them with real guest reviews before launch.</p>
        </div>
      </section>

      {/* Arrival */}
      <section className="section">
        <div className="wrap">
          <div className="head">
            <div>
              <span className="label">Before you arrive</span>
              <h2 className="title">Arrival and registration</h2>
            </div>
            <Link href="/faq" className="link">Read the FAQ <Arrow /></Link>
          </div>
          <div className="info">
            <div><span className="k">Check-in</span><b>{site.checkIn}</b><span>Early check-in when rooms are ready.</span></div>
            <div><span className="k">Check-out</span><b>{site.checkOut}</b><span>Late check-out on request.</span></div>
            <div><span className="k">Bring</span><b>Valid ID</b><span>Government ID for the lead guest.</span></div>
            <div><span className="k">Outside food</span><b>Corkage</b><span>A fee may apply. Ask the front desk.</span></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="band">
            <div>
              <h2>Pick your dates and see what is free</h2>
              <p>Live availability, instant booking reference, pay at the resort. Questions first? Email {site.email}.</p>
            </div>
            <div className="ctas">
              <Link href="/book" className="btn btn-light">Book online</Link>
              <Link href="/contact" className="btn btn-glass">Ask a question</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Location and contact */}
      <section className="section mist" id="contact">
        <div className="wrap split" style={{ alignItems: 'stretch' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <span className="label">Find us</span>
              <h2 className="title">Getting here</h2>
              <p className="lead" style={{ display: 'flex', gap: 8 }}><Pin /> {site.address}</p>
              <a href={mapLink} target="_blank" rel="noreferrer" className="link">Get directions <Arrow /></a>
            </div>
            <iframe className="map" src={mapEmbed} title="Map to the resort" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
          <div className="contact-card">
            <h2 style={{ fontSize: '1.9rem' }}>Get in touch</h2>
            <p className="muted">Planning a group trip, a day pass or a celebration? Send the details and we will reply within a day.</p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
