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
  description: `Book beachfront rooms, suites and villas at ${site.fullName}. Private beach, pool, water activities and dining on a quiet bay.`,
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
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..600;1,9..144,400&family=Inter:wght@400;500;600;700&display=swap"
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
