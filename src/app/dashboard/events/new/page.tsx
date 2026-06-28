import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { ORGANIZER_NAV } from "@/app/dashboard/page";
import { EventForm } from "@/components/event-form";
import { createClient } from "@/lib/supabase/server";
import { getCities, getCategories } from "@/lib/queries";

export const metadata = { title: "Create event" };
export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/events/new");

  const [cities, categories] = await Promise.all([getCities(), getCategories()]);

  return (
    <DashboardShell title="Create event" subtitle="Organizer" nav={ORGANIZER_NAV}>
      <EventForm cities={cities} categories={categories} />
    </DashboardShell>
  );
}