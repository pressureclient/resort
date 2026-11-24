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
  const name = str(fd, 'name');
  if (!isIsoDate(checkIn) || !isIsoDate(checkOut)) return { error: 'Please pick valid dates.' };
  if (name.length < 2) return { error: 'Please enter the name the booking should be under.' };

  const sb = await supabaseServer();
  const { data, error } = await sb.rpc('create_booking', {
    p_room_id: Number(fd.get('room_id')),
    p_in: checkIn,
    p_out: checkOut,
    p_guests: Number(fd.get('guests')),
    p_name: name,
    p_phone: str(fd, 'phone'),
    p_notes: str(fd, 'notes'),
  });
  if (error) return { error: error.message };
  revalidatePath('/account');
  redirect(`/account?booked=${(data as { ref: string }).ref}`);
}

export async function cancelBooking(fd: FormData) {
  if (!isConfigured) return;
  const sb = await supabaseServer();
  await sb.rpc('cancel_booking', { p_id: str(fd, 'id') });
  revalidatePath('/account');
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
