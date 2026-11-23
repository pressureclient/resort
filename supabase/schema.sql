-- Marisol Cove booking system
-- Run this whole file once in Supabase: SQL Editor > New query > paste > Run.

-- ---------- Tables ----------

create table if not exists public.rooms (
  id              serial primary key,
  slug            text unique not null,
  name            text not null,
  summary         text,
  price_per_night integer not null check (price_per_night > 0),
  capacity        integer not null check (capacity > 0),
  beds            text,
  size_m2         integer,
  units           integer not null default 1 check (units >= 0),
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

create table if not exists public.profiles (
  id         uuid primary key references auth.users on delete cascade,
  full_name  text,
  phone      text,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);

do $$ begin
  create type public.booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');
exception when duplicate_object then null; end $$;

create table if not exists public.bookings (
  id           uuid primary key default gen_random_uuid(),
  ref          text unique not null default upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8)),
  user_id      uuid not null references auth.users on delete cascade,
  room_id      integer not null references public.rooms,
  check_in     date not null,
  check_out    date not null,
  guests       integer not null check (guests > 0),
  guest_name   text not null check (char_length(guest_name) between 2 and 120),
  phone        text check (char_length(phone) <= 40),
  notes        text check (char_length(notes) <= 1000),
  nightly_rate integer not null,
  total        integer not null,
  status       public.booking_status not null default 'pending',
  created_at   timestamptz not null default now(),
  check (check_out > check_in)
);

create index if not exists bookings_room_dates on public.bookings (room_id, check_in, check_out);
create index if not exists bookings_user on public.bookings (user_id);

create table if not exists public.enquiries (
  id         bigserial primary key,
  name       text not null check (char_length(name) between 2 and 120),
  email      text not null check (char_length(email) <= 200),
  phone      text check (char_length(phone) <= 40),
  arrival    date,
  departure  date,
  message    text check (char_length(message) <= 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.subscribers (
  email      text primary key check (char_length(email) <= 200),
  created_at timestamptz not null default now()
);

-- ---------- New users get a profile ----------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Helpers ----------

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- Rooms still free for every night of the stay.
-- Counts the busiest night, so a room type with several units is handled correctly.
create or replace function public.units_left(p_room_id integer, p_in date, p_out date)
returns integer language sql stable security definer set search_path = public as $$
  select r.units - coalesce((
    select max(c) from (
      select count(b.id) as c
      from generate_series(p_in, p_out - 1, interval '1 day') as d(night)
      left join public.bookings b
        on b.room_id = r.id
       and b.status in ('pending', 'confirmed')
       and b.check_in <= d.night::date
       and b.check_out > d.night::date
      group by d.night
    ) per_night
  ), 0)::integer
  from public.rooms r where r.id = p_room_id;
$$;

create or replace function public.room_availability(p_in date, p_out date, p_guests integer default 1)
returns table (
  id integer, slug text, name text, price_per_night integer,
  capacity integer, units integer, units_left integer
) language sql stable security definer set search_path = public as $$
  select r.id, r.slug, r.name, r.price_per_night, r.capacity, r.units,
         greatest(public.units_left(r.id, p_in, p_out), 0)
  from public.rooms r
  where r.active and r.capacity >= p_guests
  order by r.price_per_night;
$$;

-- Creates a booking for the signed-in guest. Price is worked out here, never trusted from the browser.
create or replace function public.create_booking(
  p_room_id integer, p_in date, p_out date, p_guests integer,
  p_name text, p_phone text default null, p_notes text default null
) returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  v_uid  uuid := auth.uid();
  v_room public.rooms;
  v_row  public.bookings;
  v_nights integer := p_out - p_in;
begin
  if v_uid is null then raise exception 'Please sign in to book.'; end if;
  if p_in < current_date then raise exception 'Check-in date has passed.'; end if;
  if v_nights < 1 then raise exception 'Check-out must be after check-in.'; end if;
  if v_nights > 30 then raise exception 'Stays longer than 30 nights need to be arranged with the front desk.'; end if;

  -- Lock the room type so two guests cannot take the last unit at the same time.
  select * into v_room from public.rooms where id = p_room_id and active for update;
  if not found then raise exception 'That room is not available.'; end if;
  if p_guests < 1 or p_guests > v_room.capacity then
    raise exception 'This room sleeps up to % guests.', v_room.capacity;
  end if;
  if public.units_left(p_room_id, p_in, p_out) < 1 then
    raise exception 'Sorry, this room is fully booked for those dates.';
  end if;

  insert into public.bookings (user_id, room_id, check_in, check_out, guests, guest_name, phone, notes, nightly_rate, total)
  values (v_uid, p_room_id, p_in, p_out, p_guests, trim(p_name), nullif(trim(p_phone), ''), nullif(trim(p_notes), ''),
          v_room.price_per_night, v_room.price_per_night * v_nights)
  returning * into v_row;

  return v_row;
end $$;

-- Guests can cancel their own booking before arrival day.
create or replace function public.cancel_booking(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.bookings
     set status = 'cancelled'
   where id = p_id
     and user_id = auth.uid()
     and status in ('pending', 'confirmed')
     and check_in > current_date;
  if not found then raise exception 'This booking can no longer be cancelled online.'; end if;
end $$;

revoke execute on function public.create_booking from anon;
revoke execute on function public.cancel_booking from anon;

-- ---------- Row level security ----------

alter table public.rooms       enable row level security;
alter table public.profiles    enable row level security;
alter table public.bookings    enable row level security;
alter table public.enquiries   enable row level security;
alter table public.subscribers enable row level security;

drop policy if exists "rooms readable" on public.rooms;
create policy "rooms readable" on public.rooms for select using (true);
drop policy if exists "rooms admin" on public.rooms;
create policy "rooms admin" on public.rooms for all using (public.is_admin()) with check (public.is_admin());

-- No update policy on profiles: nobody can make themselves admin from the browser.
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());

-- Bookings are only created through create_booking().
drop policy if exists "own bookings" on public.bookings;
create policy "own bookings" on public.bookings for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "admin updates bookings" on public.bookings;
create policy "admin updates bookings" on public.bookings for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "anyone can enquire" on public.enquiries;
create policy "anyone can enquire" on public.enquiries for insert with check (true);
drop policy if exists "admin reads enquiries" on public.enquiries;
create policy "admin reads enquiries" on public.enquiries for select using (public.is_admin());

drop policy if exists "anyone can subscribe" on public.subscribers;
create policy "anyone can subscribe" on public.subscribers for insert with check (true);
drop policy if exists "admin reads subscribers" on public.subscribers;
create policy "admin reads subscribers" on public.subscribers for select using (public.is_admin());

-- ---------- Sample rooms (edit freely in Table Editor) ----------
-- Slugs must match lib/content.ts so the marketing pages and booking line up.

insert into public.rooms (slug, name, summary, price_per_night, capacity, beds, size_m2, units) values
  ('shoreline-room', 'Shoreline Room', 'Sea-facing room a few steps from the sand, with a private balcony.', 95000, 3, '1 king + 1 day bed', 35, 6),
  ('garden-annex',   'Garden Annex',   'Ground-floor room set in the palm garden, a short walk to the beach.',  70000, 5, '2 queens + 1 single', 30, 8),
  ('cove-suite',     'Cove Suite',     'Corner suite with a lounge, outdoor shower and the widest view of the bay.', 140000, 4, '1 king + sofa bed', 48, 4),
  ('family-villa',   'Family Villa',   'Two-bedroom villa with a kitchenette and a shaded deck for long afternoons.', 180000, 6, '1 king + 2 queens', 72, 2)
on conflict (slug) do nothing;
