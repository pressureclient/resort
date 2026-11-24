'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { sendEnquiry, subscribe, signIn, signUp, createBooking, type FormState } from '@/lib/actions';

export function Submit({ children, className = 'btn btn-primary' }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? 'Please wait…' : children}
    </button>
  );
}

function Msg({ state }: { state: FormState }) {
  if (state?.error) return <p className="msg err" role="alert">{state.error}</p>;
  if (state?.ok) return <p className="msg ok" role="status">{state.ok}</p>;
  return null;
}

export function ContactForm() {
  const [state, action] = useActionState(sendEnquiry, undefined);
  return (
    <form action={action} className="form">
      <div className="field"><label htmlFor="c-name">Full name</label><input id="c-name" name="name" required autoComplete="name" /></div>
      <div className="row">
        <div className="field"><label htmlFor="c-email">Email</label><input id="c-email" name="email" type="email" required autoComplete="email" /></div>
        <div className="field"><label htmlFor="c-phone">Phone</label><input id="c-phone" name="phone" type="tel" autoComplete="tel" /></div>
      </div>
      <div className="row">
        <div className="field"><label htmlFor="c-arr">Arrival</label><input id="c-arr" name="arrival" type="date" /></div>
        <div className="field"><label htmlFor="c-dep">Departure</label><input id="c-dep" name="departure" type="date" /></div>
      </div>
      <div className="field">
        <label htmlFor="c-subj">Subject</label>
        <select id="c-subj" name="subject" defaultValue="Room Reservation">
          {['Room Reservation', 'Day Tour', 'Events & Groups', 'Activities', 'Feedback', 'Other'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="field"><label htmlFor="c-msg">Message</label><textarea id="c-msg" name="message" placeholder="Group size, day tour, special requests" /></div>
      <Msg state={state} />
      <Submit>Send message</Submit>
    </form>
  );
}

export function NewsletterForm() {
  const [state, action] = useActionState(subscribe, undefined);
  return (
    <form action={action}>
      <div className="news">
        <input name="email" type="email" placeholder="Your email" aria-label="Email address" required />
        <Submit className="btn btn-light btn-sm">Subscribe</Submit>
      </div>
      {state?.ok && <p className="small" style={{ marginTop: 10, color: '#9fe3cf' }}>{state.ok}</p>}
      {state?.error && <p className="small" style={{ marginTop: 10, color: '#ffb4a8' }}>{state.error}</p>}
    </form>
  );
}

export function AuthForm({ mode, next }: { mode: 'signin' | 'signup'; next: string }) {
  const [state, action] = useActionState(mode === 'signin' ? signIn : signUp, undefined);
  return (
    <form action={action} className="form">
      <input type="hidden" name="next" value={next} />
      {mode === 'signup' && (
        <div className="field"><label htmlFor="a-name">Full name</label><input id="a-name" name="name" required autoComplete="name" /></div>
      )}
      <div className="field"><label htmlFor="a-email">Email</label><input id="a-email" name="email" type="email" required autoComplete="email" /></div>
      <div className="field">
        <label htmlFor="a-pass">Password</label>
        <input id="a-pass" name="password" type="password" required minLength={mode === 'signup' ? 8 : undefined}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
      </div>
      <Msg state={state} />
      <Submit>{mode === 'signin' ? 'Sign in' : 'Create account'}</Submit>
    </form>
  );
}

export function BookingForm(props: { roomId: number; checkIn: string; checkOut: string; guests: number; defaultName: string }) {
  const [state, action] = useActionState(createBooking, undefined);
  return (
    <form action={action} className="form">
      <input type="hidden" name="room_id" value={props.roomId} />
      <input type="hidden" name="in" value={props.checkIn} />
      <input type="hidden" name="out" value={props.checkOut} />
      <input type="hidden" name="guests" value={props.guests} />
      <div className="row">
        <div className="field"><label htmlFor="b-name">Name on booking</label><input id="b-name" name="name" required defaultValue={props.defaultName} autoComplete="name" /></div>
        <div className="field"><label htmlFor="b-phone">Phone</label><input id="b-phone" name="phone" type="tel" autoComplete="tel" placeholder="For arrival updates" /></div>
      </div>
      <div className="field"><label htmlFor="b-notes">Requests</label><textarea id="b-notes" name="notes" placeholder="Arrival time, celebrations, dietary needs" /></div>
      <Msg state={state} />
      <Submit>Confirm booking</Submit>
      <p className="small muted" style={{ margin: 0 }}>Pay at the resort. Our team confirms your booking shortly after you submit it.</p>
    </form>
  );
}
