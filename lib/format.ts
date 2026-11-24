import { site } from './site';

export function money(n: number) {
  return new Intl.NumberFormat(site.locale, {
    style: 'currency',
    currency: site.currency,
    maximumFractionDigits: 0,
  }).format(n);
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

/** Reads ?in=&out=&guests= and falls back to sensible defaults. */
export function parseStay(sp: Record<string, string | string[] | undefined>) {
  const t = today();
  let checkIn = isIsoDate(sp.in) && sp.in >= t ? sp.in : addDays(t, 1);
  let checkOut = isIsoDate(sp.out) ? sp.out : addDays(checkIn, 2);
  if (checkOut <= checkIn) checkOut = addDays(checkIn, 1);
  const g = Number(sp.guests);
  const guests = Number.isInteger(g) && g >= 1 && g <= 25 ? g : 2;
  return { checkIn, checkOut, guests, nights: nightsBetween(checkIn, checkOut) };
}
