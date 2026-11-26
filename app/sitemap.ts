import type { MetadataRoute } from 'next';
import { rooms } from '@/lib/content';

const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://laluzbeachandresort.com').replace(/\/$/, '');

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/about', '/rooms', '/activities', '/dining', '/gallery', '/faq', '/contact', '/book'];
  return [...pages, ...rooms.map((r) => `/rooms/${r.slug}`)].map((p) => ({ url: `${base}${p}` }));
}
