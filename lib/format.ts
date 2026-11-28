import { site } from './site';

export function money(n: number) {
  return new Intl.NumberFormat(site.locale, {
    style: 'currency',
    currency: site.currency,
    maximumFractionDigits: 0,
  }).format(n);
}

/** Exact amounts with centavos, e.g. \u20b16,568.80 */
export function money2(n: number | string) {
  return new Intl.NumberFormat(site.locale, {
    style: 'currency',
    currency: site.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n));
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(s: unknown): s is string {
  return typeof s === 'string' && ISO.test(s) && !Number.isNaN(Date.parse(s + 'T00:00:00Z'));
}

export function addDays(iso: string, days: number) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function today() {
  // Resort local date, so "today" matches the front desk.
  return new Intl.DateTimeFormat('en-CA', { timeZone: site.timeZone }).format(new Date());
}

export function nightsBetween(a: string, b: string) {
  return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
}

export function prettyDate(iso: string) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
}

/** Reads ?in=&out=&adults=&children=&rooms= (and the older ?guests=) with sensible defaults. */
export function parseStay(sp: Record<string, string | string[] | undefined>) {
  const t = today();
  const checkIn = isIsoDate(sp.in) && sp.in >= t ? sp.in : addDays(t, 1);
  let checkOut = isIsoDate(sp.out) ? sp.out : addDays(checkIn, 2);
  if (checkOut <= checkIn) checkOut = addDays(checkIn, 1);
  const int = (v: unknown, min: number, max: number, dflt: number) => {
    const n = Number(v);
    return Number.isInteger(n) && n >= min ? Math.min(n, max) : dflt;
  };
  const adults = int(sp.adults ?? sp.guests, 1, 45, 2);
  const children = int(sp.children, 0, 20, 0);
  const rooms = int(sp.rooms, 1, 5, 1);
  return { checkIn, checkOut, adults, children, rooms, guests: adults + children, nights: nightsBetween(checkIn, checkOut) };
}

export function stayQuery(s: { checkIn: string; checkOut: string; adults: number; children: number; rooms: number }, extra: Record<string, string> = {}) {
  return new URLSearchParams({ in: s.checkIn, out: s.checkOut, adults: String(s.adults), children: String(s.children), rooms: String(s.rooms), ...extra }).toString();
}
