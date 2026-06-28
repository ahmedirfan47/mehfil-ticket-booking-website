-- ============================================================================
--  MEHFIL — Seed data (run AFTER schema.sql + rls.sql)
--  Populates cities, categories, one demo organizer, and a handful of events
--  with ticket types so the homepage and event pages have real content.
-- ============================================================================

-- ---- CITIES -----------------------------------------------------------------
insert into public.cities (name, slug, province, image_url) values
  ('Lahore',     'lahore',     'Punjab',      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800'),
  ('Karachi',    'karachi',    'Sindh',       'https://images.unsplash.com/photo-1610116306796-6fea9f4fae38?w=800'),
  ('Islamabad',  'islamabad',  'ICT',         'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800'),
  ('Rawalpindi', 'rawalpindi', 'Punjab',      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800'),
  ('Faisalabad', 'faisalabad', 'Punjab',      'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800'),
  ('Multan',     'multan',     'Punjab',      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800'),
  ('Peshawar',   'peshawar',   'KPK',         'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800'),
  ('Quetta',     'quetta',     'Balochistan', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'),
  ('Sialkot',    'sialkot',    'Punjab',      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800'),
  ('Gujranwala', 'gujranwala', 'Punjab',      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800')
on conflict (slug) do nothing;

-- ---- CATEGORIES (icon = lucide-react name) ----------------------------------
insert into public.categories (name, slug, icon) values
  ('Concerts',         'concerts',         'Music'),
  ('Tech',             'tech',             'Cpu'),
  ('AI',               'ai',               'Sparkles'),
  ('Business',         'business',         'Briefcase'),
  ('Startup',          'startup',          'Rocket'),
  ('Workshops',        'workshops',        'Wrench'),
  ('Seminars',         'seminars',         'Presentation'),
  ('Food Festivals',   'food-festivals',   'UtensilsCrossed'),
  ('Comedy',           'comedy',           'Laugh'),
  ('Sports',           'sports',           'Trophy'),
  ('University Events','university-events', 'GraduationCap'),
  ('Networking',       'networking',       'Users'),
  ('Education',        'education',        'BookOpen')
on conflict (slug) do nothing;

-- ---- DEMO ORGANIZER ---------------------------------------------------------
-- Not tied to a real auth user (user_id null is allowed for seed display).
-- When you create your own organizer account, point events at its id instead.
insert into public.organizers (id, user_id, name, bio, status, email, phone)
values ('00000000-0000-0000-0000-0000000000a1', null,
        'Mehfil Originals', 'Curated gatherings across Pakistan.', 'approved',
        'hello@mehfil.pk', '+92 300 0000000')
on conflict (id) do nothing;

-- ---- EVENTS -----------------------------------------------------------------
do $$
declare
  c_lhr uuid; c_khi uuid; c_isb uuid;
  cat_concert uuid; cat_tech uuid; cat_ai uuid; cat_food uuid; cat_comedy uuid; cat_work uuid;
  e1 uuid; e2 uuid; e3 uuid; e4 uuid; e5 uuid; e6 uuid;
begin
  select id into c_lhr from public.cities where slug='lahore';
  select id into c_khi from public.cities where slug='karachi';
  select id into c_isb from public.cities where slug='islamabad';
  select id into cat_concert from public.categories where slug='concerts';
  select id into cat_tech from public.categories where slug='tech';
  select id into cat_ai from public.categories where slug='ai';
  select id into cat_food from public.categories where slug='food-festivals';
  select id into cat_comedy from public.categories where slug='comedy';
  select id into cat_work from public.categories where slug='workshops';

  insert into public.events (id, organizer_id, title, slug, summary, description, cover_url,
    city_id, category_id, venue, address, latitude, longitude, starts_at, ends_at,
    organizer_contact, rules, faqs, status, is_featured, is_workshop, is_free)
  values
  (gen_random_uuid(), '00000000-0000-0000-0000-0000000000a1',
   'Lahore Live: Winter Concert', 'lahore-live-winter-concert',
   'A night of qawwali, indie and electronic acts under the open sky.',
   'Mehfil presents an evening that moves from soulful qawwali into a full electronic set. Doors at 6pm, first act at 7pm. Food trucks on site.',
   'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200',
   c_lhr, cat_concert, 'Alhamra Arts Council', 'The Mall, Lahore', 31.5497, 74.3436,
   now() + interval '14 days', now() + interval '14 days 5 hours',
   '+92 300 1234567', 'No outside food or drink. Entry with valid ticket QR only.',
   '[{"q":"Is parking available?","a":"Yes, paid parking next to the venue."},{"q":"Are tickets refundable?","a":"Refunds up to 72 hours before the event."}]'::jsonb,
   'published', true, false, false) returning id into e1;

  insert into public.events (id, organizer_id, title, slug, summary, description, cover_url,
    city_id, category_id, venue, address, latitude, longitude, starts_at, ends_at,
    organizer_contact, rules, faqs, status, is_featured, is_workshop, is_free)
  values
  (gen_random_uuid(), '00000000-0000-0000-0000-0000000000a1',
   'Karachi Tech Summit 2026', 'karachi-tech-summit-2026',
   'Founders, engineers and investors for one day of talks and demos.',
   'Two stages, 30+ speakers, and a startup demo floor. Lunch and networking included.',
   'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
   c_khi, cat_tech, 'Expo Centre Karachi', 'University Road, Karachi', 24.9180, 67.0971,
   now() + interval '30 days', now() + interval '30 days 9 hours',
   '+92 21 1234567', 'Bring a laptop for the workshops. Badge required at all times.',
   '[{"q":"Will talks be recorded?","a":"Yes, ticket holders get recordings after the event."}]'::jsonb,
   'published', true, false, false) returning id into e2;

  insert into public.events (id, organizer_id, title, slug, summary, description, cover_url,
    city_id, category_id, venue, address, latitude, longitude, starts_at, ends_at,
    organizer_contact, rules, faqs, status, is_featured, is_workshop, is_free)
  values
  (gen_random_uuid(), '00000000-0000-0000-0000-0000000000a1',
   'Hands-on Generative AI Workshop', 'hands-on-generative-ai-workshop',
   'Build and ship an AI app in a single afternoon. Beginner friendly.',
   'A practical, code-along workshop. You leave with a deployed project and a roadmap.',
   'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200',
   c_isb, cat_ai, 'NUST Incubation Centre', 'H-12, Islamabad', 33.6427, 72.9905,
   now() + interval '10 days', now() + interval '10 days 4 hours',
   '+92 51 1234567', 'Laptop required. Seats limited to 40.',
   '[{"q":"Do I need prior coding experience?","a":"Basic familiarity helps but is not required."}]'::jsonb,
   'published', true, true, false) returning id into e3;

  insert into public.events (id, organizer_id, title, slug, summary, description, cover_url,
    city_id, category_id, venue, address, starts_at, ends_at, status, is_featured, is_workshop, is_free)
  values
  (gen_random_uuid(), '00000000-0000-0000-0000-0000000000a1',
   'Karachi Food Festival', 'karachi-food-festival',
   'Sixty stalls, live grills and dessert lanes by the sea.',
   'A weekend celebration of Pakistani street food and regional cuisine.',
   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200',
   c_khi, cat_food, 'Beach View Park', 'Clifton, Karachi',
   now() + interval '20 days', now() + interval '22 days', 'published', false, false, false)
   returning id into e4;

  insert into public.events (id, organizer_id, title, slug, summary, description, cover_url,
    city_id, category_id, venue, address, starts_at, ends_at, status, is_featured, is_workshop, is_free)
  values
  (gen_random_uuid(), '00000000-0000-0000-0000-0000000000a1',
   'Stand-up Comedy Night', 'stand-up-comedy-night',
   'Pakistan''s sharpest comics, one packed room.',
   'An evening of stand-up from a rotating line-up of comedians. 18+.',
   'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200',
   c_lhr, cat_comedy, 'The Last Word', 'Gulberg, Lahore',
   now() + interval '7 days', now() + interval '7 days 3 hours', 'published', false, false, false)
   returning id into e5;

  insert into public.events (id, organizer_id, title, slug, summary, description, cover_url,
    city_id, category_id, venue, address, starts_at, ends_at, status, is_featured, is_workshop, is_free)
  values
  (gen_random_uuid(), '00000000-0000-0000-0000-0000000000a1',
   'Free Career Fair for Students', 'free-career-fair-for-students',
   'Meet 50 employers hiring across Pakistan. Free entry.',
   'Open to all students and fresh graduates. Bring printed CVs.',
   'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200',
   c_isb, cat_work, 'Pak-China Centre', 'Islamabad',
   now() + interval '5 days', now() + interval '5 days 6 hours', 'published', false, false, true)
   returning id into e6;

  -- Ticket types
  insert into public.ticket_types (event_id, name, price_pkr, quantity_total, quantity_sold, sort_order) values
    (e1, 'General',  3500, 800, 612, 1),
    (e1, 'VIP',      9000, 150, 138, 2),
    (e2, 'Standard', 5000, 600, 410, 1),
    (e2, 'Investor', 15000, 80, 71, 2),
    (e3, 'Seat',     6500,  40, 33, 1),
    (e4, 'Day Pass', 1500, 2000, 540, 1),
    (e5, 'Entry',    2500, 200, 176, 1),
    (e6, 'Free RSVP',   0, 1000, 240, 1);
end $$;