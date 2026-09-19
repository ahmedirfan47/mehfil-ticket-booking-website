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
  listing_type: z.enum(["event", "trip", "activity"]).default("event"),
  title: z.string().min(3).max(160),
  summary: z.string().max(300).optional().or(z.literal("")),
  description: z.string().max(8000).optional().or(z.literal("")),
  cover_url: z.string().url().optional().or(z.literal("")),
  gallery: z.array(z.string().url()).max(12).optional(),
  video_url: z.string().url().optional().or(z.literal("")),
  city_id: z.string().uuid().optional().or(z.literal("")),
  category_id: z.string().uuid().optional().or(z.literal("")),
  venue: z.string().max(160).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  starts_at: z.string().optional().or(z.literal("")),
  ends_at: z.string().optional().or(z.literal("")),
  destination: z.string().max(160).optional().or(z.literal("")),
  duration_text: z.string().max(80).optional().or(z.literal("")),
  meeting_point: z.string().max(200).optional().or(z.literal("")),
  included: z.string().max(2000).optional().or(z.literal("")),
  excluded: z.string().max(2000).optional().or(z.literal("")),
  is_workshop: z.boolean().default(false),
  publish: z.boolean().default(false),
  ticket_types: z.array(ticketTypeSchema).min(1).max(8),
});

const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  unlimited: "Unlimited",
};

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

  const { data: gate, error: gateError } = await supabase.rpc(
    "organizer_can_create_event",
    { p_organizer_id: organizer.id }
  );
  if (gateError) {
    return NextResponse.json({ error: gateError.message }, { status: 500 });
  }
  if (gate && gate.allowed === false) {
    const planName = PLAN_LABEL[gate.plan as string] ?? "current";
    const limit = gate.limit;
    return NextResponse.json(
      {
        error:
          `You've reached your ${planName} plan limit of ${limit} listing(s) this month ` +
          `(${gate.used} used). Upgrade your plan to list more.`,
        code: "PLAN_LIMIT_REACHED",
        plan: gate.plan,
        used: gate.used,
        limit: gate.limit,
      },
      { status: 402 }
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

  const slug = `${slugify(input.title)}-${Math.random().toString(36).slice(2, 7)}`;
  const isFree = input.ticket_types.every((t) => t.price_pkr === 0);

  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({
      organizer_id: organizer.id,
      listing_type: input.listing_type,
      title: input.title,
      slug,
      summary: input.summary || null,
      description: input.description || null,
      cover_url: input.cover_url || null,
      gallery: input.gallery ?? [],
      video_url: input.video_url || null,
      city_id: input.city_id || null,
      category_id: input.category_id || null,
      venue: input.venue || null,
      address: input.address || null,
      starts_at: input.starts_at || null,
      ends_at: input.ends_at || null,
      destination: input.destination || null,
      duration_text: input.duration_text || null,
      meeting_point: input.meeting_point || null,
      included: input.included || null,
      excluded: input.excluded || null,
      is_workshop: input.is_workshop,
      is_free: isFree,
      status: input.publish ? "published" : "draft",
    })
    .select("id, slug")
    .single();

  if (eventError || !event) {
    return NextResponse.json(
      { error: eventError?.message ?? "Could not create listing." },
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
    await supabase.from("events").delete().eq("id", event.id);
    return NextResponse.json({ error: ttError.message }, { status: 400 });
  }

  return NextResponse.json({ id: event.id, slug: event.slug });
}