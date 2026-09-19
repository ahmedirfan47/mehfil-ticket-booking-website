import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  legal_name: z.string().min(2).max(160),
  business_email: z.string().email(),
  phone: z.string().min(7).max(30),
  website: z.string().url().optional().or(z.literal("")),
  facebook: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
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
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!organizer) {
    return NextResponse.json({ error: "Only organizers can request verification." }, { status: 403 });
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
  const v = parsed.data;

  const { error: insertError } = await supabase.from("organizer_verifications").insert({
    organizer_id: organizer.id,
    legal_name: v.legal_name,
    business_email: v.business_email,
    phone: v.phone,
    website: v.website || null,
    facebook: v.facebook || null,
    instagram: v.instagram || null,
    linkedin: v.linkedin || null,
    notes: v.notes || null,
    status: "pending",
  });
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  // Flip the organizer to pending so the dashboard + admin reflect it.
  await supabase
    .from("organizers")
    .update({ verification: "pending" })
    .eq("id", organizer.id);

  return NextResponse.json({ ok: true });
}