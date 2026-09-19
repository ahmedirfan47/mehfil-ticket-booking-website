import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  plan: z.enum(["free", "pro", "unlimited"]),
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
    return NextResponse.json(
      { error: "Only organizers can change a plan." },
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
    return NextResponse.json({ error: "Invalid plan." }, { status: 422 });
  }

  // NOTE: Payment gating goes here later. For now the change is applied instantly.
  const now = new Date();
  const renews = new Date(now);
  renews.setMonth(renews.getMonth() + 1);

  const { error } = await supabase
    .from("organizers")
    .update({
      plan: parsed.data.plan,
      plan_started_at: now.toISOString(),
      plan_renews_at: parsed.data.plan === "free" ? null : renews.toISOString(),
    })
    .eq("id", organizer.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, plan: parsed.data.plan });
}