import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ORGANIZER_NAV } from "@/app/dashboard/page";
import { EventEditForm } from "@/components/event-edit-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Edit listing" };
export const dynamic = "force-dynamic";

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/dashboard/events/${params.id}/edit`);

  const { data: organizer } = await supabase
    .from("organizers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!organizer) redirect("/dashboard");

  const { data: event } = await supabase
    .from("events")
    .select(
      "id, organizer_id, listing_type, title, summary, description, venue, address, starts_at, ends_at, destination, duration_text, meeting_point, included, excluded"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!event || event.organizer_id !== organizer.id) notFound();

  return (
    <DashboardShell title="Edit listing" subtitle="Organizer" nav={ORGANIZER_NAV}>
      <div className="mb-4">
        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Back to my events
        </Link>
      </div>
      <EventEditForm event={event as any} />
    </DashboardShell>
  );
}