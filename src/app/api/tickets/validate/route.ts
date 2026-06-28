import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  qrToken: z.string().uuid("That QR code is not a valid Mehfil ticket."),
  eventId: z.string().uuid(),
});

export async function POST(request: Request) {
  // Only signed-in staff/organizer/admin may validate. The middleware already
  // guards /staff, but the API is checked independently as a second gate.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "You must be signed in to scan tickets." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = profile?.role as string | undefined;
  if (!role || !["staff", "organizer", "admin"].includes(role)) {
    return NextResponse.json(
      { error: "Your account does not have scanning permission." },
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
      { result: "not_found", error: parsed.error.issues[0]?.message ?? "Invalid ticket." },
      { status: 200 }
    );
  }

  // The atomic function flips valid -> used exactly once and logs every attempt.
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("validate_ticket", {
    p_qr_token: parsed.data.qrToken,
    p_event_id: parsed.data.eventId,
    p_staff_id: user.id,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}