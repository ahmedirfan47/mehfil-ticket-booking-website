import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  source: z.string().max(40).optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid email." },
      { status: 422 }
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const supabase = createClient();

  const { error } = await supabase
    .from("waitlist")
    .insert({ email, source: parsed.data.source ?? "homepage" });

  // Duplicate email -> treat as success (already on the list).
  if (error && !error.message.toLowerCase().includes("duplicate")) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}