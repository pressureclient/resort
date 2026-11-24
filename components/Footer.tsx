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
            <h4>Quick links</h4>
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
            <h4>Stay in the loop</h4>
            <p className="small" style={{ margin: 0 }}>Seasonal offers and resort news, a few times a year.</p>
            <NewsletterForm />
          </div>
        </div>
        <div className="bottom">
          <span>© {new Date().getFullYear()} {site.fullName}. All Rights Reserved.</span>
          <span><Link href="/faq">FAQ</Link> · <Link href="/contact">Contact</Link></span>
        </div>
      </div>
    </footer>
  );
}
