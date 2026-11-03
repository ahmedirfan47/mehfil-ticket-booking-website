import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  company_name: z.string().min(2).max(160),
  contact_name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(40),
  city: z.string().max(80).optional().or(z.literal("")),
  sector: z.string().max(40).optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  facebook: z.string().url().optional().or(z.literal("")),
  instagram: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
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
      { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." },
      { status: 422 }
    );
  }
  const v = parsed.data;

  // Link the application to the user's account if they're signed in,
  // so approval can provision their organizer dashboard automatically.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("business_applications").insert({
    user_id: user?.id ?? null,
    company_name: v.company_name,
    contact_name: v.contact_name,
    email: v.email.trim().toLowerCase(),
    phone: v.phone,
    city: v.city || null,
    sector: v.sector || null,
    website: v.website || null,
    facebook: v.facebook || null,
    instagram: v.instagram || null,
    linkedin: v.linkedin || null,
    description: v.description || null,
    status: "pending",
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}