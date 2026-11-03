import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function assertOwner(userId: string, eventId: string) {
  const supabase = createClient();
  const { data: organizer } = await supabase
    .from("organizers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (!organizer) return false;
  const { data: event } = await supabase
    .from("events")
    .select("id, organizer_id")
    .eq("id", eventId)
    .maybeSingle();
  return !!event && event.organizer_id === organizer.id;
}

const addSchema = z.object({ email: z.string().email() });
const removeSchema = z.object({ user_id: z.string().uuid() });

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!(await assertOwner(user.id, params.id)))
    return NextResponse.json({ error: "Not your listing." }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email." }, { status: 422 });

  const email = parsed.data.email.trim().toLowerCase();
  const admin = createAdminClient();

  // Find the account for this email.
  const { data: profile } = await admin
    .from("profiles")
    .select("id, role, full_name, email")
    .ilike("email", email)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json(
      {
        error:
          "No Mehfil account found for that email. Ask them to sign up first with this email, then add them.",
      },
      { status: 404 }
    );
  }

  // Link them to this event (idempotent).
  const { error: linkError } = await admin
    .from("event_staff")
    .upsert({ event_id: params.id, user_id: profile.id }, { onConflict: "event_id,user_id" });
  if (linkError) return NextResponse.json({ error: linkError.message }, { status: 400 });

  // Only ever *grant* staff — never downgrade an organizer/admin.
  if (profile.role === "attendee") {
    await admin.from("profiles").update({ role: "staff" }).eq("id", profile.id);
  }

  return NextResponse.json({
    ok: true,
    member: { user_id: profile.id, full_name: profile.full_name, email: profile.email },
  });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  if (!(await assertOwner(user.id, params.id)))
    return NextResponse.json({ error: "Not your listing." }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = removeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 422 });

  const admin = createAdminClient();
  const { error } = await admin
    .from("event_staff")
    .delete()
    .eq("event_id", params.id)
    .eq("user_id", parsed.data.user_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}