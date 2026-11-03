import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function csvCell(value: string | null): string {
  const v = value ?? "";
  // Quote and escape anything with commas, quotes, or newlines.
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Admins only." }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("waitlist")
    .select("email, source, notified, created_at")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const rows = data ?? [];
  const header = "email,source,notified,joined_at";
  const body = rows
    .map((r: any) =>
      [
        csvCell(r.email),
        csvCell(r.source),
        r.notified ? "yes" : "no",
        csvCell(r.created_at),
      ].join(",")
    )
    .join("\n");

  const csv = `${header}\n${body}\n`;
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mehfil-waitlist-${stamp}.csv"`,
    },
  });
}