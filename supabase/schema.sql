-- ============================================================================
--  MEHFIL — Database schema (PostgreSQL / Supabase)
--  Run order:  1) schema.sql   2) rls.sql   3) seed.sql
--
--  Design notes
--  ------------
--  * Every ticket has TWO unique identities:
--      - id        : uuid, globally unique by construction (primary key)
--      - code      : short human code "MHF-XXXXXXXX", UNIQUE constraint
--    A separate `qr_token` (uuid) is what the QR encodes, so the printed code
--    is never the scan secret. A duplicate ticket id is therefore impossible.
--  * Inventory and ticket creation happen inside ONE function with a row lock
--    (purchase_tickets), so 500 people hitting "Buy" at once can never oversell.
--  * Validation is also a single locked transaction (validate_ticket) so the
--    same ticket can never be marked "used" twice in a race.
-- ============================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
do $$ begin
  create type user_role        as enum ('attendee', 'organizer', 'staff', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type organizer_status as enum ('pending', 'approved', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_status     as enum ('draft', 'published', 'cancelled', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ticket_status    as enum ('valid', 'used', 'cancelled', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status     as enum ('pending', 'paid', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type scan_result      as enum ('valid', 'already_used', 'cancelled', 'wrong_event', 'not_found');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- PROFILES  (1:1 with auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  email       text,
  phone       text,
  avatar_url  text,
  role        user_role not null default 'attendee',
  is_banned   boolean not null default false,
  city_id     uuid,
  created_at  timestamptz not null default now()
);
comment on table public.profiles is 'Public profile per auth user; carries the coarse role.';

-- ----------------------------------------------------------------------------
-- ROLES & PERMISSIONS  (fine-grained, optional layer on top of profiles.role)
-- ----------------------------------------------------------------------------
create table if not exists public.permissions (
  id    uuid primary key default gen_random_uuid(),
  key   text unique not null,          -- e.g. 'events.delete'
  label text not null
);

create table if not exists public.role_permissions (
  role          user_role not null,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  primary key (role, permission_id)
);

-- ----------------------------------------------------------------------------
-- CITIES & CATEGORIES
-- ----------------------------------------------------------------------------
create table if not exists public.cities (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text unique not null,
  province   text,
  image_url  text,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text unique not null,
  icon       text,                     -- lucide icon name
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- ORGANIZERS
-- ----------------------------------------------------------------------------
create table if not exists public.organizers (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete cascade,
  name        text not null,
  bio         text,
  logo_url    text,
  email       text,
  phone       text,
  website     text,
  status      organizer_status not null default 'pending',
  created_at  timestamptz not null default now(),
  unique (user_id)
);

-- ----------------------------------------------------------------------------
-- EVENTS  (workshops are events with is_workshop = true — one model, one query)
-- ----------------------------------------------------------------------------
create table if not exists public.events (
  id            uuid primary key default gen_random_uuid(),
  organizer_id  uuid references public.organizers (id) on delete set null,
  title         text not null,
  slug          text unique not null,
  summary       text,
  description   text,
  cover_url     text,
  gallery       jsonb not null default '[]'::jsonb,   -- array of image urls
  city_id       uuid references public.cities (id),
  category_id   uuid references public.categories (id),
  venue         text,
  address       text,
  latitude      double precision,
  longitude     double precision,
  starts_at     timestamptz,
  ends_at       timestamptz,
  organizer_contact text,
  rules         text,
  faqs          jsonb not null default '[]'::jsonb,    -- [{q,a}]
  status        event_status not null default 'draft',
  is_featured   boolean not null default false,
  is_workshop   boolean not null default false,
  is_free       boolean not null default false,
  view_count    integer not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists idx_events_status      on public.events (status);
create index if not exists idx_events_city        on public.events (city_id);
create index if not exists idx_events_category    on public.events (category_id);
create index if not exists idx_events_starts_at   on public.events (starts_at);
create index if not exists idx_events_featured    on public.events (is_featured) where is_featured;
-- Full-text search across title/summary/venue.
create index if not exists idx_events_search on public.events
  using gin (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(summary,'') || ' ' || coalesce(venue,'')));

-- ----------------------------------------------------------------------------
-- TICKET TYPES  (price tiers per event)
-- ----------------------------------------------------------------------------
create table if not exists public.ticket_types (
  id              uuid primary key default gen_random_uuid(),
  event_id        uuid not null references public.events (id) on delete cascade,
  name            text not null,             -- 'General', 'VIP', 'Early Bird'
  description     text,
  price_pkr       integer not null default 0, -- store paisa-free whole rupees
  quantity_total  integer not null default 0,
  quantity_sold   integer not null default 0,
  is_active       boolean not null default true,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  check (quantity_sold >= 0),
  check (quantity_sold <= quantity_total)
);
create index if not exists idx_ticket_types_event on public.ticket_types (event_id);

-- ----------------------------------------------------------------------------
-- ORDERS  (== payments)
-- ----------------------------------------------------------------------------
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  order_number  text unique not null default ('MHF-O-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10))),
  user_id       uuid references auth.users (id) on delete set null,
  event_id      uuid references public.events (id) on delete set null,
  buyer_name    text,
  buyer_email   text,
  buyer_phone   text,
  amount_pkr    integer not null default 0,
  status        order_status not null default 'pending',
  payment_method text,                    -- 'jazzcash' | 'easypaisa' | 'card' | 'free'
  payment_ref   text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_orders_user  on public.orders (user_id);
create index if not exists idx_orders_event on public.orders (event_id);

-- ----------------------------------------------------------------------------
-- TICKETS
-- ----------------------------------------------------------------------------
create table if not exists public.tickets (
  id              uuid primary key default gen_random_uuid(),
  code            text unique not null,    -- human-facing "MHF-XXXXXXXX"
  qr_token        uuid not null default gen_random_uuid(), -- what the QR encodes
  order_id        uuid references public.orders (id) on delete set null,
  event_id        uuid not null references public.events (id) on delete cascade,
  ticket_type_id  uuid not null references public.ticket_types (id) on delete cascade,
  owner_id        uuid references auth.users (id) on delete set null,
  holder_name     text,
  seat_label      text,
  status          ticket_status not null default 'valid',
  scanned_at      timestamptz,
  scanned_by      uuid references auth.users (id),
  created_at      timestamptz not null default now()
);
create unique index if not exists idx_tickets_qr_token on public.tickets (qr_token);
create index if not exists idx_tickets_owner on public.tickets (owner_id);
create index if not exists idx_tickets_event on public.tickets (event_id);

-- ----------------------------------------------------------------------------
-- TICKET SCANS  (audit trail — every scan attempt, valid or not)
-- ----------------------------------------------------------------------------
create table if not exists public.ticket_scans (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid references public.tickets (id) on delete set null,
  event_id    uuid references public.events (id) on delete set null,
  scanned_by  uuid references auth.users (id),
  result      scan_result not null,
  scanned_at  timestamptz not null default now()
);
create index if not exists idx_scans_event on public.ticket_scans (event_id);

-- ----------------------------------------------------------------------------
-- EVENT STAFF  (who may scan which event)
-- ----------------------------------------------------------------------------
create table if not exists public.event_staff (
  event_id   uuid not null references public.events (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  added_at   timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- ----------------------------------------------------------------------------
-- FAVORITES
-- ----------------------------------------------------------------------------
create table if not exists public.favorites (
  user_id    uuid not null references auth.users (id) on delete cascade,
  event_id   uuid not null references public.events (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS
-- ----------------------------------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null,
  body       text,
  link       text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notif_user on public.notifications (user_id, is_read);

-- ----------------------------------------------------------------------------
-- AUDIT LOGS
-- ----------------------------------------------------------------------------
create table if not exists public.audit_logs (
  id         uuid primary key default gen_random_uuid(),
  actor_id   uuid references auth.users (id) on delete set null,
  action     text not null,
  entity     text,
  entity_id  text,
  meta       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_logs_created on public.audit_logs (created_at desc);

-- ============================================================================
-- TRIGGER: auto-create a profile row when a new auth user signs up
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- FUNCTION: purchase_tickets — atomic, race-safe, never oversells, unique codes
--   Returns the created order id + the ticket ids/codes/qr_tokens.
-- ============================================================================
create or replace function public.purchase_tickets(
  p_ticket_type_id uuid,
  p_quantity       integer,
  p_buyer_name     text,
  p_buyer_email    text,
  p_buyer_phone    text default null,
  p_user_id        uuid default null
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_type     public.ticket_types%rowtype;
  v_event    public.events%rowtype;
  v_order_id uuid;
  v_amount   integer;
  v_code     text;
  v_ticket   jsonb;
  v_tickets  jsonb := '[]'::jsonb;
  i          integer;
begin
  if p_quantity is null or p_quantity < 1 or p_quantity > 10 then
    raise exception 'Quantity must be between 1 and 10';
  end if;

  -- Lock the ticket-type row so concurrent buyers serialize here.
  select * into v_type from public.ticket_types
    where id = p_ticket_type_id for update;
  if not found then
    raise exception 'Ticket type not found';
  end if;
  if not v_type.is_active then
    raise exception 'This ticket type is no longer on sale';
  end if;
  if v_type.quantity_sold + p_quantity > v_type.quantity_total then
    raise exception 'Only % ticket(s) left', v_type.quantity_total - v_type.quantity_sold;
  end if;

  select * into v_event from public.events where id = v_type.event_id;
  v_amount := v_type.price_pkr * p_quantity;

  -- Create the order (treated paid immediately here; wire a real gateway later).
  insert into public.orders (user_id, event_id, buyer_name, buyer_email, buyer_phone,
                             amount_pkr, status, payment_method)
  values (p_user_id, v_event.id, p_buyer_name, p_buyer_email, p_buyer_phone,
          v_amount, 'paid', case when v_amount = 0 then 'free' else 'card' end)
  returning id into v_order_id;

  -- Reserve inventory.
  update public.ticket_types
    set quantity_sold = quantity_sold + p_quantity
    where id = p_ticket_type_id;

  -- Mint each ticket with a unique human code. The UNIQUE constraint on
  -- tickets.code is the hard guarantee; the loop retries on the rare collision.
  for i in 1..p_quantity loop
    loop
      v_code := 'MHF-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
      begin
        insert into public.tickets (code, order_id, event_id, ticket_type_id,
                                    owner_id, holder_name, status)
        values (v_code, v_order_id, v_event.id, p_ticket_type_id,
                p_user_id, p_buyer_name, 'valid')
        returning jsonb_build_object('id', id, 'code', code, 'qr_token', qr_token)
        into v_ticket;
        exit; -- inserted ok
      exception when unique_violation then
        -- astronomically rare; regenerate and retry
      end;
    end loop;
    v_tickets := v_tickets || v_ticket;
  end loop;

  return jsonb_build_object(
    'order_id', v_order_id,
    'amount_pkr', v_amount,
    'tickets', v_tickets
  );
end;
$$;

-- ============================================================================
-- FUNCTION: validate_ticket — single locked transaction, idempotent-safe.
--   Flips a 'valid' ticket to 'used' exactly once. Always logs the attempt.
-- ============================================================================
create or replace function public.validate_ticket(
  p_qr_token  uuid,
  p_event_id  uuid,
  p_staff_id  uuid default null
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_ticket public.tickets%rowtype;
  v_result scan_result;
begin
  select * into v_ticket from public.tickets
    where qr_token = p_qr_token for update;

  if not found then
    v_result := 'not_found';
    insert into public.ticket_scans (ticket_id, event_id, scanned_by, result)
      values (null, p_event_id, p_staff_id, v_result);
    return jsonb_build_object('result', v_result);
  end if;

  if v_ticket.event_id <> p_event_id then
    v_result := 'wrong_event';
  elsif v_ticket.status = 'cancelled' or v_ticket.status = 'refunded' then
    v_result := 'cancelled';
  elsif v_ticket.status = 'used' then
    v_result := 'already_used';
  else
    -- The one place a ticket transitions to used.
    update public.tickets
      set status = 'used', scanned_at = now(), scanned_by = p_staff_id
      where id = v_ticket.id;
    v_result := 'valid';
  end if;

  insert into public.ticket_scans (ticket_id, event_id, scanned_by, result)
    values (v_ticket.id, p_event_id, p_staff_id, v_result);

  return jsonb_build_object(
    'result',      v_result,
    'code',        v_ticket.code,
    'holder_name', v_ticket.holder_name,
    'seat_label',  v_ticket.seat_label,
    'scanned_at',  v_ticket.scanned_at
  );
end;
$$;

-- Helper used by RLS policies to check the caller's role without recursion.
-- NOTE: named mehfil_role (NOT current_role) — current_role is a reserved word.
create or replace function public.mehfil_role()
returns user_role
language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;