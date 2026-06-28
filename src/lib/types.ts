// Domain types shared across the app. The Database type is intentionally
// lightweight (not the full generated types) so the project compiles without a
// network call. Regenerate the full version with:
//   npx supabase gen types typescript --project-id <ref> > src/lib/types.ts

export type UserRole = "attendee" | "organizer" | "staff" | "admin";
export type EventStatus = "draft" | "published" | "cancelled" | "completed";
export type TicketStatus = "valid" | "used" | "cancelled" | "refunded";
export type ScanResult =
  | "valid"
  | "already_used"
  | "cancelled"
  | "wrong_event"
  | "not_found";

export interface City {
  id: string;
  name: string;
  slug: string;
  province: string | null;
  image_url: string | null;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  is_active: boolean;
}

export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price_pkr: number;
  quantity_total: number;
  quantity_sold: number;
  is_active: boolean;
  sort_order: number;
}

export interface Organizer {
  id: string;
  name: string;
  bio: string | null;
  logo_url: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
}

export interface EventRecord {
  id: string;
  organizer_id: string | null;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  cover_url: string | null;
  gallery: string[];
  city_id: string | null;
  category_id: string | null;
  venue: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  starts_at: string | null;
  ends_at: string | null;
  organizer_contact: string | null;
  rules: string | null;
  faqs: { q: string; a: string }[];
  status: EventStatus;
  is_featured: boolean;
  is_workshop: boolean;
  is_free: boolean;
  view_count: number;
}

// Event joined with its city, category, and ticket types — used on cards/pages.
export interface EventWithRelations extends EventRecord {
  city: City | null;
  category: Category | null;
  organizer: Organizer | null;
  ticket_types: TicketType[];
}

export interface TicketRecord {
  id: string;
  code: string;
  qr_token: string;
  event_id: string;
  ticket_type_id: string;
  holder_name: string | null;
  seat_label: string | null;
  status: TicketStatus;
  scanned_at: string | null;
  created_at: string;
}

// Minimal stand-in so the typed client compiles. Replace with generated types.
export type Database = any;