import Link from 'next/link';
import { site } from '@/lib/site';
import { Logo } from './Icons';
import { NewsletterForm } from './Forms';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="cols">
          <div>
            <Link href="/" className="logo"><Logo /> {site.name}</Link>
            <p className="small">{site.tagline}. {site.address}.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/rooms">Rooms</Link></li>
              <li><Link href="/book">Booking</Link></li>
              <li><Link href="/activities">Activities</Link></li>
              <li><Link href="/dining">Dining</Link></li>
              <li><Link href="/gallery">Gallery</Link></li>
            </ul>
          </div>
          <div>
            <h4>Guest help</h4>
            <ul>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/account">My bookings</Link></li>
              <li><Link href="/login">Sign in</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
              <li><a href={`tel:${site.phone.replace(/\s/g, '')}`}>{site.phone}</a></li>
            </ul>
          </div>
          <div>
            <h4>Offers and news</h4>
            <p className="small" style={{ margin: 0 }}>Seasonal rates and weekend events, about once a month.</p>
            <NewsletterForm />
          </div>
        </div>
        <div className="bottom">
          <span>© {new Date().getFullYear()} {site.fullName}. All rights reserved.</span>
          <span style={{ display: 'flex', gap: 18 }}>
            <a href={site.socials.instagram} target="_blank" rel="noreferrer">Instagram</a>
            <a href={site.socials.facebook} target="_blank" rel="noreferrer">Facebook</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
