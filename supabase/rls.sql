-- ============================================================================
--  MEHFIL — Row Level Security
--  Run AFTER schema.sql.
--
--  Principle: reads are public for published content; writes are owner- or
--  role-scoped. Inventory changes and ticket minting/validation go through the
--  SECURITY DEFINER functions (purchase_tickets / validate_ticket), so the
--  tables themselves stay locked to direct client writes.
-- ============================================================================

alter table public.profiles        enable row level security;
alter table public.organizers      enable row level security;
alter table public.cities          enable row level security;
alter table public.categories      enable row level security;
alter table public.events          enable row level security;
alter table public.ticket_types    enable row level security;
alter table public.orders          enable row level security;
alter table public.tickets         enable row level security;
alter table public.ticket_scans    enable row level security;
alter table public.event_staff     enable row level security;
alter table public.favorites       enable row level security;
alter table public.notifications   enable row level security;
alter table public.audit_logs      enable row level security;
alter table public.permissions     enable row level security;
alter table public.role_permissions enable row level security;

-- ---- helper -----------------------------------------------------------------
-- current_role() is defined in schema.sql and is SECURITY DEFINER.

-- ---- PROFILES ---------------------------------------------------------------
create policy "profiles: read own"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: read admin" on public.profiles for select using (current_role() = 'admin');
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id);
create policy "profiles: admin write" on public.profiles for all
  using (current_role() = 'admin') with check (current_role() = 'admin');

-- ---- CITIES & CATEGORIES (public read, admin write) -------------------------
create policy "cities: public read"     on public.cities     for select using (is_active or current_role() = 'admin');
create policy "cities: admin write"     on public.cities     for all using (current_role() = 'admin') with check (current_role() = 'admin');
create policy "categories: public read" on public.categories for select using (is_active or current_role() = 'admin');
create policy "categories: admin write" on public.categories for all using (current_role() = 'admin') with check (current_role() = 'admin');

-- ---- ORGANIZERS -------------------------------------------------------------
create policy "organizers: public read approved" on public.organizers for select using (status = 'approved' or user_id = auth.uid() or current_role() = 'admin');
create policy "organizers: self insert"          on public.organizers for insert with check (user_id = auth.uid());
create policy "organizers: self update"          on public.organizers for update using (user_id = auth.uid() or current_role() = 'admin');
create policy "organizers: admin all"            on public.organizers for all using (current_role() = 'admin') with check (current_role() = 'admin');

-- ---- EVENTS -----------------------------------------------------------------
create policy "events: public read published" on public.events for select
  using (status = 'published'
         or current_role() = 'admin'
         or organizer_id in (select id from public.organizers where user_id = auth.uid()));
create policy "events: organizer insert" on public.events for insert
  with check (organizer_id in (select id from public.organizers where user_id = auth.uid()));
create policy "events: organizer update" on public.events for update
  using (organizer_id in (select id from public.organizers where user_id = auth.uid()) or current_role() = 'admin');
create policy "events: organizer delete" on public.events for delete
  using (organizer_id in (select id from public.organizers where user_id = auth.uid()) or current_role() = 'admin');

-- ---- TICKET TYPES -----------------------------------------------------------
create policy "ticket_types: public read" on public.ticket_types for select
  using (event_id in (select id from public.events where status = 'published')
         or current_role() = 'admin'
         or event_id in (select e.id from public.events e
                         join public.organizers o on o.id = e.organizer_id
                         where o.user_id = auth.uid()));
create policy "ticket_types: organizer write" on public.ticket_types for all
  using (event_id in (select e.id from public.events e
                      join public.organizers o on o.id = e.organizer_id
                      where o.user_id = auth.uid()) or current_role() = 'admin')
  with check (event_id in (select e.id from public.events e
                           join public.organizers o on o.id = e.organizer_id
                           where o.user_id = auth.uid()) or current_role() = 'admin');

-- ---- ORDERS -----------------------------------------------------------------
create policy "orders: read own"   on public.orders for select using (user_id = auth.uid() or current_role() = 'admin');
create policy "orders: admin all"  on public.orders for all using (current_role() = 'admin') with check (current_role() = 'admin');
-- inserts happen via purchase_tickets (definer); no client insert policy granted.

-- ---- TICKETS ----------------------------------------------------------------
create policy "tickets: read own" on public.tickets for select
  using (owner_id = auth.uid()
         or current_role() = 'admin'
         or event_id in (select event_id from public.event_staff where user_id = auth.uid())
         or event_id in (select e.id from public.events e
                         join public.organizers o on o.id = e.organizer_id
                         where o.user_id = auth.uid()));
-- writes (mint/validate) go through definer functions only.

-- ---- TICKET SCANS -----------------------------------------------------------
create policy "scans: staff/organizer read" on public.ticket_scans for select
  using (current_role() = 'admin'
         or event_id in (select event_id from public.event_staff where user_id = auth.uid())
         or event_id in (select e.id from public.events e
                         join public.organizers o on o.id = e.organizer_id
                         where o.user_id = auth.uid()));

-- ---- EVENT STAFF ------------------------------------------------------------
create policy "event_staff: read" on public.event_staff for select
  using (user_id = auth.uid() or current_role() = 'admin'
         or event_id in (select e.id from public.events e
                         join public.organizers o on o.id = e.organizer_id
                         where o.user_id = auth.uid()));
create policy "event_staff: organizer manage" on public.event_staff for all
  using (event_id in (select e.id from public.events e
                      join public.organizers o on o.id = e.organizer_id
                      where o.user_id = auth.uid()) or current_role() = 'admin')
  with check (event_id in (select e.id from public.events e
                           join public.organizers o on o.id = e.organizer_id
                           where o.user_id = auth.uid()) or current_role() = 'admin');

-- ---- FAVORITES --------------------------------------------------------------
create policy "favorites: own all" on public.favorites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---- NOTIFICATIONS ----------------------------------------------------------
create policy "notifications: own read"   on public.notifications for select using (user_id = auth.uid() or current_role() = 'admin');
create policy "notifications: own update" on public.notifications for update using (user_id = auth.uid());
create policy "notifications: admin write" on public.notifications for all using (current_role() = 'admin') with check (current_role() = 'admin');

-- ---- AUDIT LOGS (admin only) ------------------------------------------------
create policy "logs: admin read" on public.audit_logs for select using (current_role() = 'admin');

-- ---- PERMISSIONS (admin manage, all authenticated read) ---------------------
create policy "perms: read"  on public.permissions      for select using (auth.uid() is not null);
create policy "perms: admin" on public.permissions      for all using (current_role() = 'admin') with check (current_role() = 'admin');
create policy "rp: read"     on public.role_permissions for select using (auth.uid() is not null);
create policy "rp: admin"    on public.role_permissions for all using (current_role() = 'admin') with check (current_role() = 'admin');