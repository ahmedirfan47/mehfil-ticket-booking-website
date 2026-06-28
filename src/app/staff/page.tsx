import Link from "next/link";
import { redirect } from "next/navigation";
import { ScanLine, ShieldCheck } from "lucide-react";
import { StaffScanner } from "@/components/staff-scanner";
import { createClient } from "@/lib/supabase/server";
import { getEventOptions } from "@/lib/queries";

export const metadata = { title: "Staff scanner" };
export const dynamic = "force-dynamic";

export default async function StaffPortalPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/staff");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const role = profile?.role as string | undefined;
  const allowed = role && ["staff", "organizer", "admin"].includes(role);

  const events = allowed ? await getEventOptions() : [];

  return (
    <div className="min-h-screen bg-mesh-hero">
      <header className="border-b border-line/60 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <span className="grid h-8 w-8 place-content-center rounded-lg bg-primary text-white">
              <ScanLine className="h-4 w-4" />
            </span>
            Mehfil <span className="text-ink-muted">Scan</span>
          </Link>
          <span className="text-sm text-ink-muted">{profile?.full_name ?? user.email}</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {!allowed ? (
          <div className="rounded-3xl border border-line bg-white p-8 text-center shadow-card">
            <ShieldCheck className="mx-auto h-10 w-10 text-ink-muted" />
            <h1 className="heading-display mt-3 text-2xl">No scanning access</h1>
            <p className="mt-2 text-sm text-ink-muted">
              Your account isn’t assigned as event staff. Ask the organizer to add you, or head back
              to the main site.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex h-10 items-center rounded-xl bg-primary px-5 text-sm font-medium text-white"
            >
              Back to Mehfil
            </Link>
          </div>
        ) : (
          <>
            <span className="eyebrow">Door control</span>
            <h1 className="heading-display mt-2 text-3xl">Scan tickets</h1>
            <p className="mt-2 text-sm text-ink-muted">
              Choose your event, then scan each guest’s QR. Every scan is logged. A valid ticket is
              admitted once and instantly marked used.
            </p>
            <div className="mt-6 rounded-3xl border border-line bg-white p-5 shadow-card sm:p-6">
              <StaffScanner events={events} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}