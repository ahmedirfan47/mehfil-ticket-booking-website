import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const editSchema = z.object({
  title: z.string().min(3).max(160),
  summary: z.string().max(300).optional().or(z.literal("")),
  description: z.string().max(8000).optional().or(z.literal("")),
  venue: z.string().max(160).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  starts_at: z.string().optional().or(z.literal("")),
  ends_at: z.string().optional().or(z.literal("")),
  destination: z.string().max(160).optional().or(z.literal("")),
  duration_text: z.string().max(80).optional().or(z.literal("")),
  meeting_point: z.string().max(200).optional().or(z.literal("")),
  included: z.string().max(2000).optional().or(z.literal("")),
  excluded: z.string().max(2000).optional().or(z.literal("")),
});

// Confirm the signed-in user owns this listing; returns organizer id or null.
async function ownerOrNull(supabase: any, userId: string, eventId: string) {
  const { data: organizer } = await supabase
    .from("organizers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!organizer) return null;
  const { data: event } = await supabase
    .from("events")
    .select("id, organizer_id")
    .eq("id", eventId)
    .maybeSingle();
  if (!event || event.organizer_id !== organizer.id) return null;
  return organizer.id;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const owner = await ownerOrNull(supabase, user.id, params.id);
  if (!owner) return NextResponse.json({ error: "Not your listing." }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = editSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 422 }
    );
  }
  const v = parsed.data;

  const { error } = await supabase
    .from("events")
    .update({
      title: v.title,
      summary: v.summary || null,
      description: v.description || null,
      venue: v.venue || null,
      address: v.address || null,
      starts_at: v.starts_at || null,
      ends_at: v.ends_at || null,
      destination: v.destination || null,
      duration_text: v.duration_text || null,
      meeting_point: v.meeting_point || null,
      included: v.included || null,
      excluded: v.excluded || null,
    })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// Cancel: stops sales, shows "cancelled" to buyers. Reversible in DB, not a delete.
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const owner = await ownerOrNull(supabase, user.id, params.id);
  if (!owner) return NextResponse.json({ error: "Not your listing." }, { status: 403 });

  const { error } = await supabase
    .from("events")
    .update({ status: "cancelled" })
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}