'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { isConfigured, supabaseServer } from './supabase/server';
import { isIsoDate } from './format';

export type FormState = { error?: string; ok?: string } | undefined;

const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim();
const notReady: FormState = { error: 'Bookings are not connected yet. Add the Supabase keys to go live.' };

function safeNext(v: string) {
  return v.startsWith('/') && !v.startsWith('//') ? v : '/account';
}

async function origin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? 'https';
  return `${proto}://${host}`;
}

// ---------- Auth ----------

export async function signIn(_: FormState, fd: FormData): Promise<FormState> {
  if (!isConfigured) return notReady;
  const sb = await supabaseServer();
  const { error } = await sb.auth.signInWithPassword({ email: str(fd, 'email'), password: str(fd, 'password') });
  if (error) return { error: 'That email and password do not match.' };
  redirect(safeNext(str(fd, 'next')));
}

export async function signUp(_: FormState, fd: FormData): Promise<FormState> {
  if (!isConfigured) return notReady;
  const name = str(fd, 'name');
  const password = str(fd, 'password');
  if (name.length < 2) return { error: 'Please enter your full name.' };
  if (password.length < 8) return { error: 'Use at least 8 characters for your password.' };
  const next = safeNext(str(fd, 'next'));
  const sb = await supabaseServer();
  const { data, error } = await sb.auth.signUp({
    email: str(fd, 'email'),
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { error: error.message };
  if (data.session) redirect(next);
  return { ok: 'Account created. Check your email to confirm it, then sign in.' };
}

// ---------- Bookings ----------

export async function createBooking(_: FormState, fd: FormData): Promise<FormState> {
  if (!isConfigured) return notReady;
  const checkIn = str(fd, 'in');
  const checkOut = str(fd, 'out');
  if (!isIsoDate(checkIn) || !isIsoDate(checkOut)) return { error: 'Please pick valid dates.' };
  const pm = Number(fd.get('payment_method_id'));
  if (!pm) return { error: 'Please choose how you would like to pay.' };

  const sb = await supabaseServer();
  const { data, error } = await sb.rpc('create_booking', {
    p_room_id: Number(fd.get('room_id')),
    p_in: checkIn,
    p_out: checkOut,
    p_adults: Number(fd.get('adults')),
    p_children: Number(fd.get('children')),
    p_rooms: Number(fd.get('rooms')),
    p_first_name: str(fd, 'first_name'),
    p_last_name: str(fd, 'last_name'),
    p_email: str(fd, 'email'),
    p_phone: str(fd, 'phone'),
    p_country: str(fd, 'country'),
    p_notes: str(fd, 'notes'),
    p_promo: str(fd, 'promo') || null,
    p_payment_method_id: pm,
  });
  if (error) return { error: error.message };
  const b = data as { ref: string; access_token: string };
  revalidatePath('/account');
  redirect(`/booking/${b.ref}?t=${b.access_token}&new=1`);
}

export type Quote = { subtotal: number; discount: number; vat: number; service_charge: number; total: number; promo_valid: boolean };

/** Price for the review step, with or without a promo code. */
export async function getQuote(input: { roomId: number; checkIn: string; checkOut: string; rooms: number; promo: string }): Promise<Quote | null> {
  if (!isConfigured || !isIsoDate(input.checkIn) || !isIsoDate(input.checkOut)) return null;
  const sb = await supabaseServer();
  const { data } = await sb.rpc('stay_quote', {
    p_room_id: input.roomId, p_in: input.checkIn, p_out: input.checkOut, p_rooms: input.rooms, p_promo: input.promo || null,
  });
  const q = (data as Quote[] | null)?.[0];
  return q ? { ...q, subtotal: +q.subtotal, discount: +q.discount, vat: +q.vat, service_charge: +q.service_charge, total: +q.total } : null;
}

export async function setPaymentMethod(fd: FormData) {
  if (!isConfigured) return;
  const ref = str(fd, 'ref');
  const token = str(fd, 'token');
  const sb = await supabaseServer();
  await sb.rpc('set_payment_method', { p_ref: ref, p_token: token, p_method_id: Number(fd.get('method_id')) });
  redirect(`/booking/${ref}?t=${token}`);
}

const RECEIPT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'];

export async function uploadReceipt(_: FormState, fd: FormData): Promise<FormState> {
  if (!isConfigured) return notReady;
  const ref = str(fd, 'ref').toUpperCase();
  const token = str(fd, 'token');
  const file = fd.get('receipt');
  if (!(file instanceof File) || file.size === 0) return { error: 'Please choose a photo or PDF of your receipt.' };
  if (file.size > 5 * 1024 * 1024) return { error: 'That file is over 5 MB. Please upload a smaller photo or screenshot.' };
  if (!RECEIPT_TYPES.includes(file.type)) return { error: 'Please upload a JPG, PNG, WebP, HEIC or PDF file.' };
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'jpg';
  const path = `${ref}/receipt-${Date.now()}.${ext}`;
  const sb = await supabaseServer();
  const up = await sb.storage.from('receipts').upload(path, file, { contentType: file.type, upsert: false });
  if (up.error) return { error: 'Upload failed. Please try again, or email the receipt to us.' };
  const { error } = await sb.rpc('attach_receipt', { p_ref: ref, p_token: token, p_path: path });
  if (error) return { error: error.message };
  revalidatePath(`/booking/${ref}`);
  redirect(`/booking/${ref}?t=${token}&uploaded=1`);
}

/** Guests without an account find their booking with reference + email. */
export async function findBooking(_: FormState, fd: FormData): Promise<FormState> {
  if (!isConfigured) return notReady;
  const ref = str(fd, 'ref').toUpperCase();
  const email = str(fd, 'email');
  if (!ref || !email) return { error: 'Enter your booking reference and the email you booked with.' };
  const sb = await supabaseServer();
  const { data } = await sb.rpc('get_booking', { p_ref: ref, p_token: null, p_email: email });
  const b = (data as { ref: string; access_token: string }[] | null)?.[0];
  if (!b) return { error: 'We could not find a booking with that reference and email.' };
  redirect(`/booking/${b.ref}?t=${b.access_token}`);
}

export async function cancelBookingByToken(fd: FormData) {
  if (!isConfigured) return;
  const ref = str(fd, 'ref');
  const token = str(fd, 'token');
  const sb = await supabaseServer();
  await sb.rpc('cancel_booking_by_token', { p_ref: ref, p_token: token });
  revalidatePath('/account');
  redirect(`/booking/${ref}?t=${token}`);
}

const STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

export async function setBookingStatus(fd: FormData) {
  if (!isConfigured) return;
  const status = str(fd, 'status');
  if (!STATUSES.includes(status)) return;
  const sb = await supabaseServer();
  // Row level security only lets admins update bookings.
  await sb.from('bookings').update({ status }).eq('id', str(fd, 'id'));
  revalidatePath('/admin');
}

// ---------- Enquiries and newsletter ----------

export async function sendEnquiry(_: FormState, fd: FormData): Promise<FormState> {
  if (!isConfigured) return notReady;
  const name = str(fd, 'name');
  const email = str(fd, 'email');
  if (name.length < 2 || !email.includes('@')) return { error: 'Please add your name and a valid email.' };
  const arrival = str(fd, 'arrival');
  const departure = str(fd, 'departure');
  const sb = await supabaseServer();
  const { error } = await sb.from('enquiries').insert({
    name,
    email,
    phone: str(fd, 'phone') || null,
    arrival: isIsoDate(arrival) ? arrival : null,
    departure: isIsoDate(departure) ? departure : null,
    message: [str(fd, 'subject') && `[${str(fd, 'subject')}]`, str(fd, 'message')].filter(Boolean).join(' ').slice(0, 2000) || null,
  });
  if (error) return { error: 'Could not send right now. Please email us instead.' };
  return { ok: 'Thanks. Our reservations team will reply within 24 hours.' };
}

export async function subscribe(_: FormState, fd: FormData): Promise<FormState> {
  if (!isConfigured) return notReady;
  const email = str(fd, 'email').toLowerCase();
  if (!email.includes('@')) return { error: 'Enter a valid email.' };
  const sb = await supabaseServer();
  const { error } = await sb.from('subscribers').insert({ email });
  if (error && error.code !== '23505') return { error: 'Could not subscribe right now.' };
  return { ok: 'You are on the list.' };
}

// ---------- Admin settings (row level security also limits these to admins) ----------

async function adminClient() {
  const { getProfile } = await import('./supabase/server');
  const { isAdmin } = await getProfile();
  if (!isAdmin) throw new Error('Admins only');
  return supabaseServer();
}

const pct = (v: string) => Math.min(50, Math.max(0, Number(v) || 0));

export async function setPaymentStatus(fd: FormData) {
  const sb = await adminClient();
  const status = str(fd, 'payment_status');
  if (!['unpaid', 'receipt_uploaded', 'paid'].includes(status)) return;
  await sb.from('bookings').update({ payment_status: status }).eq('id', str(fd, 'id'));
  revalidatePath('/admin');
}

export async function saveCharges(fd: FormData) {
  const sb = await adminClient();
  await sb.from('settings').update({ vat_percent: pct(str(fd, 'vat')), service_percent: pct(str(fd, 'service')), updated_at: new Date().toISOString() }).eq('id', true);
  revalidatePath('/admin');
}

export async function savePaymentMethod(fd: FormData) {
  const sb = await adminClient();
  const row = {
    name: str(fd, 'name').slice(0, 60),
    summary: str(fd, 'summary').slice(0, 120) || 'Pay & upload receipt · confirmed by our team',
    details: str(fd, 'details').slice(0, 2000),
    active: fd.get('active') === 'on',
    sort: Number(fd.get('sort')) || 0,
    updated_at: new Date().toISOString(),
  };
  if (row.name.length < 2) return;
  const id = Number(fd.get('id'));
  if (id) await sb.from('payment_methods').update(row).eq('id', id);
  else await sb.from('payment_methods').insert(row);
  revalidatePath('/admin');
}

export async function savePromo(fd: FormData) {
  const sb = await adminClient();
  const code = str(fd, 'code').toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  const percent = Math.min(100, Math.max(0, Number(str(fd, 'percent')) || 0));
  if (code.length < 3 || percent <= 0) return;
  await sb.from('promo_codes').upsert({
    code, percent_off: percent, active: true,
    valid_from: isIsoDate(str(fd, 'from')) ? str(fd, 'from') : null,
    valid_to: isIsoDate(str(fd, 'to')) ? str(fd, 'to') : null,
    note: str(fd, 'note').slice(0, 200) || null,
  });
  revalidatePath('/admin');
}

export async function togglePromo(fd: FormData) {
  const sb = await adminClient();
  await sb.from('promo_codes').update({ active: fd.get('active') === 'true' }).eq('code', str(fd, 'code'));
  revalidatePath('/admin');
}
