# La Luz Beach Resort

Website and booking system for La Luz Beach Resort, Laiya, San Juan, Batangas. Content, room types, prices and photos come from laluzbeachandresort.com.

**What's in it**

- Marketing site: home, about, rooms (plus a page for each room), activities, dining and menu, gallery, FAQ, contact
- Live availability by date and guest count, worked out per night, so a room type with several units never gets overbooked
- Guest accounts (email and password), booking with a reference number, and "My bookings" with self-service cancellation
- Front desk admin page: arrivals today, guests in house, pending bookings, status changes, enquiries and newsletter count
- Enquiry form and newsletter signup saved to the database

Built with Next.js 15 and Supabase (Postgres, auth and row level security). The site runs in **demo mode** until Supabase is connected, so you can preview it straight away.

## 1. Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. You will see a "Demo mode" note on the booking pages until step 2 is done.

## 2. Connect Supabase (free tier is fine)

1. Create a project at https://supabase.com.
2. Open **SQL Editor > New query**, paste all of `supabase/schema.sql`, and press **Run**. This creates the tables, the booking rules and four sample rooms. It is safe to run again.
3. Open **Project Settings > API** and copy the Project URL and the `anon` public key.
4. Copy `.env.example` to `.env.local` and paste them in:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

5. In Supabase go to **Authentication > URL Configuration**. Set Site URL to your site address and add `http://localhost:3000/**` and `https://YOUR-DOMAIN/**` to Redirect URLs.

Then run `supabase/migrations/002_guest_checkout.sql` the same way. It adds booking without an account, adults and children, booking several rooms at once, weekend rates, the 2% service charge and the room availability calendar.

Restart `npm run dev`. Booking, sign-in and enquiries are now live.

**Testing without email confirmation:** in **Authentication > Providers > Email** you can turn off "Confirm email" while testing. New accounts are then signed in right away.

## 3. Make yourself admin

Create an account on the site, then run this once in the SQL Editor with your email:

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'you@example.com');
```

Sign out and back in. An **Admin** link appears in the nav and `/admin` opens the front desk.

## 4. Push to GitHub

Create an empty repo on the GitHub account you want (no README), then from this folder:

```bash
git init
git add .
git commit -m "La Luz Beach Resort site with booking system"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/marisol-cove.git
git push -u origin main
```

If your Mac is signed in to a different GitHub account, GitHub will ask for that account's username and a personal access token (Settings > Developer settings > Personal access tokens) as the password.

## 5. Deploy on Vercel

1. Import the GitHub repo at https://vercel.com/new.
2. Add the three variables from `.env.local` under Environment Variables, with `NEXT_PUBLIC_SITE_URL` set to the live address.
3. Deploy, then add the live URL to Supabase Redirect URLs (step 2.5).

## Rebranding

| What | Where |
| --- | --- |
| Name, email, phone, address, map location, currency, check-in times | `lib/site.ts` |
| Room text, photos, amenities, activities, dining, menu, reviews, FAQ, gallery | `lib/content.ts` |
| Colours and fonts | top of `app/globals.css` and the font link in `app/layout.tsx` |
| Room prices, capacity and number of units (used for booking) | Supabase **Table Editor > rooms** |

Room `slug` values must match between `lib/content.ts` and the `rooms` table. Prices on the marketing pages come from `lib/content.ts`, while bookings always use the database price, so update both when rates change.

Photos and the logo live in `public/images`, copied from La Luz's old site, so the site does not depend on the old server. To change a photo, replace the file there or add a new one and update its path in `lib/content.ts`.

Room `units` in Supabase are set to 1 per room type until the real counts are confirmed. Set them in Table Editor > rooms so availability is right.

## How booking works

- `room_availability()` checks every night of the stay and returns how many units are left on the busiest night.
- `create_booking()` runs on the server, locks the room type, re-checks availability, and works out the price itself, so nobody can book a full room or change the price from the browser.
- Guests book in 5 steps (Dates, Room, Info, Review, Pay) **without an account**. Each booking gets a reference and a private link; guests can reopen it under My Bookings with reference + email.
- Prices are the nightly rate for each night (weekend rate on Friday and Saturday nights where a room has one) times the number of rooms, plus a service charge (2% by default, in the `settings` table).
- Bookings start as **pending**. Staff confirm them in `/admin`. Guests can cancel pending or confirmed bookings until the day before arrival.
- Row level security means guests only ever see their own bookings, and only admins can change a booking status or read enquiries.

Payment is "pay at the resort". To take deposits online, add a Philippine payment gateway (for example PayMongo or Xendit) after `create_booking()` and mark the booking confirmed from its webhook.
