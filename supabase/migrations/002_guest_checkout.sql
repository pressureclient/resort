-- 002: Booking like laluzbeachandresort.com.
-- Book without an account, adults + children, up to 5 rooms per booking, weekend rates,
-- VAT + service charge, promo codes, GCash / bank transfer with receipt upload,
-- room availability calendar. Admin can edit payment methods, VAT, service charge and promo codes.
-- Run once in Supabase: SQL Editor > New query > paste > Run. Safe to run again.

-- ---------- Settings (one row, editable from Admin) ----------
create table if not exists public.settings (
  id              boolean primary key default true check (id),
  vat_percent     numeric(5,2) not null default 1.00 check (vat_percent between 0 and 50),
  service_percent numeric(5,2) not null default 1.00 check (service_percent between 0 and 50),
  weekend_days    int[] not null default '{5,6}',  -- nights starting Fri (5) and Sat (6) use the weekend rate
  max_rooms       int not null default 5 check (max_rooms between 1 and 20),
  updated_at      timestamptz not null default now()
);
alter table public.settings add column if not exists vat_percent numeric(5,2) not null default 1.00;
alter table public.settings add column if not exists service_percent numeric(5,2) not null default 1.00;
insert into public.settings (id) values (true) on conflict (id) do nothing;
alter table public.settings enable row level security;
drop policy if exists "settings readable" on public.settings;
create policy "settings readable" on public.settings for select using (true);
drop policy if exists "settings admin" on public.settings;
create policy "settings admin" on public.settings for update using (public.is_admin()) with check (public.is_admin());

-- ---------- Payment methods (admin edits name, account details, on/off) ----------
create table if not exists public.payment_methods (
  id         serial primary key,
  name       text not null check (char_length(name) between 2 and 60),
  summary    text not null default 'Pay & upload receipt · confirmed by our team',
  details    text not null default '',   -- account name, number, bank, instructions shown to the guest
  active     boolean not null default true,
  sort       integer not null default 0,
  updated_at timestamptz not null default now()
);
insert into public.payment_methods (name, sort)
select v.name, v.sort from (values ('GCash (send money)', 1), ('Bank Transfer', 2)) v(name, sort)
where not exists (select 1 from public.payment_methods);
alter table public.payment_methods enable row level security;
drop policy if exists "payment methods readable" on public.payment_methods;
create policy "payment methods readable" on public.payment_methods for select using (active or public.is_admin());
drop policy if exists "payment methods admin" on public.payment_methods;
create policy "payment methods admin" on public.payment_methods for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Promo codes (admin adds them; guests can only check one code at a time) ----------
create table if not exists public.promo_codes (
  code        text primary key check (code = upper(code) and char_length(code) between 3 and 30),
  percent_off numeric(5,2) not null check (percent_off > 0 and percent_off <= 100),
  active      boolean not null default true,
  valid_from  date,
  valid_to    date,
  note        text,
  created_at  timestamptz not null default now()
);
alter table public.promo_codes enable row level security;
drop policy if exists "promo admin" on public.promo_codes;
create policy "promo admin" on public.promo_codes for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.promo_percent(p_code text)
returns numeric language sql stable security definer set search_path = public as $$
  select percent_off from public.promo_codes
  where code = upper(trim(coalesce(p_code, ''))) and active
    and (valid_from is null or valid_from <= (now() at time zone 'Asia/Manila')::date)
    and (valid_to   is null or valid_to   >= (now() at time zone 'Asia/Manila')::date);
$$;
grant execute on function public.promo_percent(text) to anon, authenticated;

-- ---------- Rooms: weekend rate ----------
alter table public.rooms add column if not exists weekend_price integer check (weekend_price is null or weekend_price > 0);
update public.rooms set weekend_price = 8349 where slug = 'annex-loft-room' and weekend_price is null;

-- ---------- Bookings ----------
alter table public.bookings alter column user_id drop not null;
alter table public.bookings add column if not exists guest_email    text check (guest_email is null or char_length(guest_email) <= 200);
alter table public.bookings add column if not exists country        text check (country is null or char_length(country) <= 60);
alter table public.bookings add column if not exists adults         integer not null default 1 check (adults >= 1);
alter table public.bookings add column if not exists children       integer not null default 0 check (children >= 0);
alter table public.bookings add column if not exists rooms          integer not null default 1 check (rooms between 1 and 20);
alter table public.bookings add column if not exists subtotal       numeric(12,2);
alter table public.bookings add column if not exists discount       numeric(12,2) not null default 0;
alter table public.bookings add column if not exists promo_code     text;
alter table public.bookings add column if not exists vat            numeric(12,2) not null default 0;
alter table public.bookings add column if not exists service_charge numeric(12,2) not null default 0;
alter table public.bookings add column if not exists fee            numeric(12,2) not null default 0;  -- vat + service charge
alter table public.bookings add column if not exists payment_method text;
alter table public.bookings add column if not exists payment_status text not null default 'unpaid';
alter table public.bookings add column if not exists receipt_path   text;
alter table public.bookings add column if not exists access_token   uuid not null default gen_random_uuid();
alter table public.bookings alter column total type numeric(12,2);
alter table public.bookings alter column nightly_rate type numeric(12,2);
do $$ begin
  alter table public.bookings add constraint bookings_payment_status_check check (payment_status in ('unpaid', 'receipt_uploaded', 'paid'));
exception when duplicate_object then null; end $$;
update public.bookings set subtotal = total where subtotal is null;
create index if not exists bookings_ref_upper on public.bookings (upper(ref));

-- ---------- Pricing ----------
create or replace function public.stay_subtotal(p_room_id integer, p_in date, p_out date, p_rooms integer default 1)
returns numeric language sql stable security definer set search_path = public as $$
  select coalesce(sum(case when extract(dow from d.night)::int = any (s.weekend_days) and r.weekend_price is not null
                           then r.weekend_price else r.price_per_night end), 0) * greatest(p_rooms, 1)
  from public.rooms r
  cross join public.settings s
  cross join generate_series(p_in, p_out - 1, interval '1 day') as d(night)
  where r.id = p_room_id;
$$;

-- Full price breakdown for a stay: room subtotal, promo discount, VAT, service charge, total.
create or replace function public.stay_quote(p_room_id integer, p_in date, p_out date, p_rooms integer default 1, p_promo text default null)
returns table (subtotal numeric, discount numeric, vat numeric, service_charge numeric, total numeric, promo_valid boolean)
language sql stable security definer set search_path = public as $$
  with b as (
    select public.stay_subtotal(p_room_id, p_in, p_out, p_rooms) as sub, public.promo_percent(p_promo) as pct
  ), d as (
    select sub, pct, round(sub * coalesce(pct, 0) / 100, 2) as disc from b
  ), t as (
    select d.*, s.vat_percent, s.service_percent from d cross join public.settings s
  )
  select sub, disc,
         round((sub - disc) * vat_percent / 100, 2),
         round((sub - disc) * service_percent / 100, 2),
         (sub - disc) + round((sub - disc) * vat_percent / 100, 2) + round((sub - disc) * service_percent / 100, 2),
         pct is not null
  from t;
$$;
grant execute on function public.stay_quote(integer, date, date, integer, text) to anon, authenticated;

-- Units still free on the busiest night of the stay, counting rooms per booking.
create or replace function public.units_left(p_room_id integer, p_in date, p_out date)
returns integer language sql stable security definer set search_path = public as $$
  select r.units - coalesce((
    select max(c) from (
      select coalesce(sum(b.rooms), 0) as c
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

drop function if exists public.room_availability(date, date, integer);
drop function if exists public.room_availability(date, date, integer, integer);
create or replace function public.room_availability(p_in date, p_out date, p_guests integer default 1, p_rooms integer default 1)
returns table (
  id integer, slug text, name text, price_per_night integer, weekend_price integer,
  capacity integer, units integer, units_left integer, subtotal numeric, vat numeric, service_charge numeric, total numeric
) language sql stable security definer set search_path = public as $$
  select r.id, r.slug, r.name, r.price_per_night, r.weekend_price, r.capacity, r.units,
         greatest(public.units_left(r.id, p_in, p_out), 0),
         q.subtotal, q.vat, q.service_charge, q.total
  from public.rooms r
  cross join lateral public.stay_quote(r.id, p_in, p_out, p_rooms, null) q
  where r.active and r.capacity * greatest(p_rooms, 1) >= p_guests
  order by r.price_per_night;
$$;

-- ---------- Booking ----------
drop function if exists public.create_booking(integer, date, date, integer, integer, integer, text, text, text, text);
create or replace function public.create_booking(
  p_room_id integer, p_in date, p_out date, p_adults integer, p_children integer, p_rooms integer,
  p_first_name text, p_last_name text, p_email text, p_phone text, p_country text default null,
  p_notes text default null, p_promo text default null, p_payment_method_id integer default null
) returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  v_uid    uuid := auth.uid();
  v_room   public.rooms;
  v_set    public.settings;
  v_pm     public.payment_methods;
  v_q      record;
  v_row    public.bookings;
  v_nights integer := p_out - p_in;
  v_guests integer := coalesce(p_adults, 0) + coalesce(p_children, 0);
  v_email  text := lower(trim(coalesce(p_email, '')));
  v_name   text := trim(trim(coalesce(p_first_name, '')) || ' ' || trim(coalesce(p_last_name, '')));
begin
  select * into v_set from public.settings where id;
  if char_length(trim(coalesce(p_first_name, ''))) < 1 or char_length(trim(coalesce(p_last_name, ''))) < 1 then
    raise exception 'Please enter the guest''s first and last name.';
  end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Please enter a valid email address.'; end if;
  if char_length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) < 7 then raise exception 'Please enter a valid phone number.'; end if;
  if p_in < (now() at time zone 'Asia/Manila')::date then raise exception 'Check-in date has passed.'; end if;
  if v_nights < 1 then raise exception 'Check-out must be after check-in.'; end if;
  if v_nights > 30 then raise exception 'Stays longer than 30 nights need to be arranged with the front desk.'; end if;
  if coalesce(p_adults, 0) < 1 then raise exception 'At least one adult is required.'; end if;
  if coalesce(p_children, 0) < 0 then raise exception 'Invalid number of children.'; end if;
  if coalesce(p_rooms, 0) < 1 or p_rooms > v_set.max_rooms then raise exception 'You can book 1 to % rooms at a time.', v_set.max_rooms; end if;
  if p_promo is not null and trim(p_promo) <> '' and public.promo_percent(p_promo) is null then
    raise exception 'That promo code is not valid.';
  end if;
  if p_payment_method_id is not null then
    select * into v_pm from public.payment_methods where id = p_payment_method_id and active;
    if not found then raise exception 'Please choose a payment method.'; end if;
  end if;

  -- Lock the room type so two guests cannot take the last unit at the same time.
  select * into v_room from public.rooms where id = p_room_id and active for update;
  if not found then raise exception 'That room is not available.'; end if;
  if v_guests > v_room.capacity * p_rooms then
    raise exception '% room(s) of this type sleep up to % guests.', p_rooms, v_room.capacity * p_rooms;
  end if;
  if public.units_left(p_room_id, p_in, p_out) < p_rooms then
    raise exception 'Sorry, there are not enough rooms of this type left for those dates.';
  end if;

  select * into v_q from public.stay_quote(p_room_id, p_in, p_out, p_rooms, p_promo);

  insert into public.bookings (user_id, guest_email, room_id, check_in, check_out, adults, children, guests, rooms,
                               guest_name, phone, country, notes, nightly_rate, subtotal, discount, promo_code,
                               vat, service_charge, fee, total, payment_method)
  values (v_uid, v_email, p_room_id, p_in, p_out, p_adults, coalesce(p_children, 0), v_guests, p_rooms,
          v_name, trim(p_phone), nullif(trim(coalesce(p_country, '')), ''), nullif(trim(coalesce(p_notes, '')), ''),
          round(v_q.subtotal / (v_nights * p_rooms), 2), v_q.subtotal, v_q.discount,
          case when v_q.promo_valid then upper(trim(p_promo)) end,
          v_q.vat, v_q.service_charge, v_q.vat + v_q.service_charge, v_q.total, v_pm.name)
  returning * into v_row;
  return v_row;
end $$;
grant execute on function public.create_booking(integer, date, date, integer, integer, integer, text, text, text, text, text, text, text, integer) to anon, authenticated;

-- Open a booking with its private link, or with reference + email.
drop function if exists public.get_booking(text, uuid, text);
create or replace function public.get_booking(p_ref text, p_token uuid default null, p_email text default null)
returns table (
  id uuid, ref text, status public.booking_status, room_name text, room_slug text, check_in date, check_out date,
  adults integer, children integer, rooms integer, guest_name text, guest_email text, phone text, country text, notes text,
  subtotal numeric, discount numeric, promo_code text, vat numeric, service_charge numeric, total numeric,
  payment_method text, payment_status text, has_receipt boolean, access_token uuid, created_at timestamptz
) language sql stable security definer set search_path = public as $$
  select b.id, b.ref, b.status, r.name, r.slug, b.check_in, b.check_out, b.adults, b.children, b.rooms,
         b.guest_name, b.guest_email, b.phone, b.country, b.notes, b.subtotal, b.discount, b.promo_code,
         b.vat, b.service_charge, b.total, b.payment_method, b.payment_status, b.receipt_path is not null,
         b.access_token, b.created_at
  from public.bookings b join public.rooms r on r.id = b.room_id
  where upper(b.ref) = upper(trim(p_ref))
    and ((p_token is not null and b.access_token = p_token)
      or (p_email is not null and lower(b.guest_email) = lower(trim(p_email))))
  limit 1;
$$;
grant execute on function public.get_booking(text, uuid, text) to anon, authenticated;

-- Guest picks / changes how they will pay (before paying).
create or replace function public.set_payment_method(p_ref text, p_token uuid, p_method_id integer)
returns void language plpgsql security definer set search_path = public as $$
declare v_pm public.payment_methods;
begin
  select * into v_pm from public.payment_methods where id = p_method_id and active;
  if not found then raise exception 'Please choose a payment method.'; end if;
  update public.bookings set payment_method = v_pm.name
   where upper(ref) = upper(trim(p_ref)) and access_token = p_token and payment_status = 'unpaid' and status = 'pending';
  if not found then raise exception 'This booking can no longer be changed online.'; end if;
end $$;
grant execute on function public.set_payment_method(text, uuid, integer) to anon, authenticated;

-- Guest uploads their GCash / bank receipt; staff then confirm.
create or replace function public.attach_receipt(p_ref text, p_token uuid, p_path text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_path !~ ('^' || upper(trim(p_ref)) || '/[A-Za-z0-9._-]+$') then raise exception 'Invalid receipt file.'; end if;
  update public.bookings set receipt_path = p_path, payment_status = 'receipt_uploaded'
   where upper(ref) = upper(trim(p_ref)) and access_token = p_token and status in ('pending', 'confirmed') and payment_status <> 'paid';
  if not found then raise exception 'This booking cannot take a receipt right now.'; end if;
end $$;
grant execute on function public.attach_receipt(text, uuid, text) to anon, authenticated;

-- Guests can cancel before arrival day using their private link.
create or replace function public.cancel_booking_by_token(p_ref text, p_token uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.bookings
     set status = 'cancelled'
   where upper(ref) = upper(trim(p_ref)) and access_token = p_token
     and status in ('pending', 'confirmed')
     and check_in > (now() at time zone 'Asia/Manila')::date;
  if not found then raise exception 'This booking can no longer be cancelled online.'; end if;
end $$;
grant execute on function public.cancel_booking_by_token(text, uuid) to anon, authenticated;

-- Signed-in guests also see bookings made with their (confirmed) email.
drop policy if exists "own bookings" on public.bookings;
create policy "own bookings" on public.bookings for select using (
  user_id = auth.uid()
  or (guest_email is not null and lower(guest_email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  or public.is_admin()
);

-- ---------- Room page availability calendar ----------
create or replace function public.room_full_dates(p_room_id integer, p_from date, p_to date)
returns setof date language sql stable security definer set search_path = public as $$
  select d.night::date
  from generate_series(p_from, p_to, interval '1 day') as d(night)
  where public.units_left(p_room_id, d.night::date, d.night::date + 1) < 1;
$$;
grant execute on function public.room_full_dates(integer, date, date) to anon, authenticated;

-- ---------- Receipt uploads (Supabase Storage) ----------
-- Private bucket: anyone can upload a receipt into their booking's folder, only admins can view them.
do $$ begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
   begin
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('receipts', 'receipts', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'])
    on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
    execute 'drop policy if exists "receipts upload" on storage.objects';
    execute $p$create policy "receipts upload" on storage.objects for insert to anon, authenticated
             with check (bucket_id = 'receipts' and (storage.foldername(name))[1] ~ '^[A-F0-9]{8}$')$p$;
    execute 'drop policy if exists "receipts admin read" on storage.objects';
    execute $p$create policy "receipts admin read" on storage.objects for select to authenticated
             using (bucket_id = 'receipts' and public.is_admin())$p$;
   exception when insufficient_privilege then
     raise notice 'Could not create the receipts bucket policies here; add them in Storage > Policies.';
   end;
  end if;
end $$;

-- Make the API see the new functions straight away.
notify pgrst, 'reload schema';
