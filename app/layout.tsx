import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { getProfile } from '@/lib/supabase/server';
import { site } from '@/lib/site';

// Dates and sign-in state change per request, so render on demand.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { default: `${site.fullName} | ${site.tagline}`, template: `%s | ${site.name}` },
  description: `${site.fullName}, a hidden gem on the shores of Laiya, San Juan, Batangas. Book beachfront rooms, lofts and villas, with a private beach, pool, water activities and dining.`,
  icons: { icon: site.logo },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, fullName } = await getProfile();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Montserrat:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <Nav signedIn={Boolean(user)} isAdmin={isAdmin} firstName={fullName?.split(' ')[0] ?? null} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
