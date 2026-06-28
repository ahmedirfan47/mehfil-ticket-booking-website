import { createClient } from "@/lib/supabase/server";
import type { City, Category, EventWithRelations } from "@/lib/types";

const EVENT_SELECT = `
  *,
  city:cities(*),
  category:categories(*),
  organizer:organizers(*),
  ticket_types(*)
`;

function shape(row: any): EventWithRelations {
  return {
    ...row,
    city: row.city ?? null,
    category: row.category ?? null,
    organizer: row.organizer ?? null,
    gallery: row.gallery ?? [],
    faqs: row.faqs ?? [],
    ticket_types: row.ticket_types ?? [],
  } as EventWithRelations;
}

export async function getFeaturedEvents(limit = 5): Promise<EventWithRelations[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("starts_at", { ascending: true })
    .limit(limit);
  return (data ?? []).map(shape);
}

export async function getEvents(opts: {
  limit?: number;
  workshopsOnly?: boolean;
  citySlug?: string;
  categorySlug?: string;
  q?: string;
  orderBy?: "starts_at" | "created_at";
} = {}): Promise<EventWithRelations[]> {
  const supabase = createClient();
  let query = supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("status", "published");

  if (opts.workshopsOnly) query = query.eq("is_workshop", true);
  if (opts.q) query = query.ilike("title", `%${opts.q}%`);
  query = query.order(opts.orderBy ?? "starts_at", { ascending: true });
  if (opts.limit) query = query.limit(opts.limit);

  const { data } = await query;
  let events = (data ?? []).map(shape);

  if (opts.citySlug) events = events.filter((e) => e.city?.slug === opts.citySlug);
  if (opts.categorySlug) events = events.filter((e) => e.category?.slug === opts.categorySlug);

  return events;
}

export async function getEventBySlug(slug: string): Promise<EventWithRelations | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("slug", slug)
    .single();
  return data ? shape(data) : null;
}

export async function getEventById(id: string): Promise<EventWithRelations | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("id", id)
    .single();
  return data ? shape(data) : null;
}

export async function getEventOptions(): Promise<{ id: string; title: string; starts_at: string }[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("events")
    .select("id, title, starts_at")
    .eq("status", "published")
    .order("starts_at", { ascending: true });
  return (data ?? []) as { id: string; title: string; starts_at: string }[];
}

export async function getCities(): Promise<City[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("cities")
    .select("*")
    .eq("is_active", true)
    .order("name");
  return (data ?? []) as City[];
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const supabase = createClient();
  const { data } = await supabase.from("cities").select("*").eq("slug", slug).single();
  return (data as City) ?? null;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("name");
  return (data ?? []) as Category[];
}