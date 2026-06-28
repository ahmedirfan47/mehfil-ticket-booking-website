import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

const ticketTypeSchema = z.object({
  name: z.string().min(1).max(60),
  price_pkr: z.number().int().min(0).max(10_000_000),
  quantity_total: z.number().int().min(1).max(1_000_000),
});

const schema = z.object({
  title: z.string().min(3).max(160),
  summary: z.string().max(300).optional().or(z.literal("")),
  description: z.string().max(8000).optional().or(z.literal("")),
  cover_url: z.string().url().optional().or(z.literal("")),
  city_id: z.string().uuid().optional().or(z.literal("")),
  category_id: z.string().uuid().optional().or(z.literal("")),
  venue: z.string().max(160).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  starts_at: z.string().optional().or(z.literal("")),
  ends_at: z.string().optional().or(z.literal("")),
  is_workshop: z.boolean().default(false),
  publish: z.boolean().default(false),
  ticket_types: z.array(ticketTypeSchema).min(1).max(8),
});

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const { data: organizer } = await supabase
    .from("organizers")
    .select("id, status")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!organizer) {
    return NextResponse.json(
      { error: "You need an approved organizer profile to create events." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 422 }
    );
  }
  const input = parsed.data;

  // Unique-ish slug; the DB unique constraint is the real guard.
  const slug = `${slugify(input.title)}-${Math.random().toString(36).slice(2, 7)}`;
  const isFree = input.ticket_types.every((t) => t.price_pkr === 0);

  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({
      organizer_id: organizer.id,
      title: input.title,
      slug,
      summary: input.summary || null,
      description: input.description || null,
      cover_url: input.cover_url || null,
      city_id: input.city_id || null,
      category_id: input.category_id || null,
      venue: input.venue || null,
      address: input.address || null,
      starts_at: input.starts_at || null,
      ends_at: input.ends_at || null,
      is_workshop: input.is_workshop,
      is_free: isFree,
      status: input.publish ? "published" : "draft",
    })
    .select("id, slug")
    .single();

  if (eventError || !event) {
    return NextResponse.json(
      { error: eventError?.message ?? "Could not create event." },
      { status: 400 }
    );
  }

  const rows = input.ticket_types.map((t, i) => ({
    event_id: event.id,
    name: t.name,
    price_pkr: t.price_pkr,
    quantity_total: t.quantity_total,
    sort_order: i,
  }));
  const { error: ttError } = await supabase.from("ticket_types").insert(rows);
  if (ttError) {
    // Roll back the event so we don't leave a ticketless shell.
    await supabase.from("events").delete().eq("id", event.id);
    return NextResponse.json({ error: ttError.message }, { status: 400 });
  }

  return NextResponse.json({ id: event.id, slug: event.slug });
}