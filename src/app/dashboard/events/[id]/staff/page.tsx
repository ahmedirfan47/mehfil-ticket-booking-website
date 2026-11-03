import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ORGANIZER_NAV } from "@/app/dashboard/page";
import { StaffManager } from "@/components/staff-manager";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Door staff" };
export const dynamic = "force-dynamic";

export default async function EventStaffPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/dashboard/events/${params.id}/staff`);

  const { data: organizer } = await supabase
    .from("organizers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!organizer) redirect("/dashboard");

  const { data: event } = await supabase
    .from("events")
    .select("id, title, organizer_id")
    .eq("id", params.id)
    .maybeSingle();
  if (!event || event.organizer_id !== organizer.id) notFound();

  // Current staff for this event (admin client to read linked profiles).
  const admin = createAdminClient();
  const { data: links } = await admin
    .from("event_staff")
    .select("user_id, profiles:profiles(full_name, email)")
    .eq("event_id", params.id);

  const initial = (links ?? []).map((l: any) => ({
    user_id: l.user_id,
    full_name: l.profiles?.full_name ?? null,
    email: l.profiles?.email ?? null,
  }));

  return (
    <DashboardShell title="Door staff" subtitle="Organizer" nav={ORGANIZER_NAV}>
      <div className="mb-4">
        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Back to my events
        </Link>
      </div>
      <p className="mb-6 text-sm text-ink-muted">
        Managing staff for <span className="font-medium text-ink">{event.title}</span>.
      </p>
      <StaffManager eventId={params.id} initial={initial} />
    </DashboardShell>
  );
}