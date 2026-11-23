'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo, Menu } from './Icons';
import { site } from '@/lib/site';

const links = [
  { href: '/about', label: 'About' },
  { href: '/rooms', label: 'Rooms' },
  { href: '/activities', label: 'Activities' },
  { href: '/dining', label: 'Dining' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
];

export default function Nav({ signedIn, isAdmin, firstName }: { signedIn: boolean; isAdmin: boolean; firstName: string | null }) {
  const path = usePathname();
  const overHero = path === '/' || path === '/about' || path === '/activities';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  const cls = ['nav', overHero ? 'over-hero' : 'solid', scrolled ? 'scrolled' : ''].join(' ');

  return (
    <header className={cls}>
      <div className="wrap">
        <Link href="/" className="logo" aria-label={`${site.name} home`}>
          <Logo /> {site.name}
        </Link>
        <nav className="nav-links" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
        </nav>
        <div className="nav-actions">
          {isAdmin && <Link href="/admin" className="nav-user hide-md">Admin</Link>}
          {signedIn ? (
            <Link href="/account" className="nav-user hide-sm">{firstName ? `Hi, ${firstName}` : 'My bookings'}</Link>
          ) : (
            <Link href="/login" className="nav-user hide-sm">Sign in</Link>
          )}
          <Link href="/book" className="btn btn-primary btn-sm">Book now</Link>
          <details className="mobile-menu" key={path}>
            <summary aria-label="Open menu"><Menu /></summary>
            <div className="panel">
              {links.map((l) => (
                <Link key={l.href} href={l.href}>{l.label}</Link>
              ))}
              <Link href="/faq">FAQ</Link>
              {signedIn ? <Link href="/account">My bookings</Link> : <Link href="/login">Sign in</Link>}
              {isAdmin && <Link href="/admin">Admin</Link>}
              {signedIn && (
                <form action="/auth/signout" method="post"><button type="submit">Sign out</button></form>
              )}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
