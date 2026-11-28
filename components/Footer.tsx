import Link from 'next/link';
import { site } from '@/lib/site';
import { NewsletterForm } from './Forms';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="cols">
          <div>
            <Link href="/" className="logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={site.logo} alt={site.fullName} className="logo-img" />
            </Link>
            <p className="small">{site.footerLine}</p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/rooms">Rooms</Link></li>
              <li><Link href="/book">Booking</Link></li>
              <li><Link href="/activities">Activities</Link></li>
              <li><Link href="/gallery">Gallery</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4>Guest Help</h4>
            <ul>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/account">My Bookings</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
              <li><a href={`tel:${site.phone.replace(/[^+\d]/g, '')}`}>{site.phone}</a></li>
              <li>{site.address}</li>
            </ul>
          </div>
        </div>
        <div className="news-row">
          <div>
            <h4 style={{ marginBottom: 4 }}>Stay in the loop</h4>
            <p className="small" style={{ margin: 0 }}>Seasonal offers and resort news, a few times a year.</p>
          </div>
          <NewsletterForm />
        </div>
        <div className="bottom">
          <span>© {new Date().getFullYear()} {site.name}. All Rights Reserved.</span>
          <a href="/sitemap.xml">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
