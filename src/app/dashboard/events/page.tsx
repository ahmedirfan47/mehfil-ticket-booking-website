import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Users, Pencil } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ORGANIZER_NAV } from "@/app/dashboard/page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CancelListingButton } from "@/components/cancel-listing-button";
import { createClient } from "@/lib/supabase/server";
import { formatPKR, formatDateShort } from "@/lib/utils";

export const metadata = { title: "My events" };
export const dynamic = "force-dynamic";

export default async function OrganizerEventsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/events");

  const { data: organizer } = await supabase
    .from("organizers")
    .select("id, name")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: events } = organizer
    ? await supabase
        .from("events")
        .select(
          "id, title, slug, status, starts_at, is_workshop, listing_type, ticket_types(price_pkr, quantity_total, quantity_sold)"
        )
        .eq("organizer_id", organizer.id)
        .order("starts_at", { ascending: false })
    : { data: [] as any[] };

  const list = (events ?? []) as any[];

  const TYPE_LABEL: Record<string, string> = {
    event: "Event",
    trip: "Trip",
    activity: "Activity",
  };

  const STATUS_TONE: Record<string, "valid" | "invalid" | "neutral" | "accent"> = {
    published: "valid",
    draft: "neutral",
    cancelled: "invalid",
    completed: "accent",
  };

  return (
    <DashboardShell title="My events" subtitle="Organizer" nav={ORGANIZER_NAV}>
      <div className="mb-4 flex justify-end">
        <Link href="/dashboard/events/new">
          <Button variant="primary" size="sm">
            <Plus className="mr-1.5 h-4 w-4" /> Create listing
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-mist bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-mist text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Listing</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Sold</th>
                <th className="px-5 py-3 font-medium">Revenue</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Manifest</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mist">
              {list.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-ink-muted">
                    No listings yet. Create your first one to start selling tickets.
                  </td>
                </tr>
              )}
              {list.map((e) => {
                const sold = (e.ticket_types ?? []).reduce(
                  (s: number, t: any) => s + t.quantity_sold,
                  0
                );
                const cap = (e.ticket_types ?? []).reduce(
                  (s: number, t: any) => s + t.quantity_total,
                  0
                );
                const rev = (e.ticket_types ?? []).reduce(
                  (s: number, t: any) => s + t.quantity_sold * t.price_pkr,
                  0
                );
                const cancelled = e.status === "cancelled";
                return (
                  <tr key={e.id} className="hover:bg-sky-50/40">
                    <td className="px-5 py-3">
                      <Link href={`/events/${e.slug}`} className="font-medium text-ink hover:text-sky">
                        {e.title}
                      </Link>
                      {e.is_workshop && <span className="ml-2 text-xs text-ink-muted">Workshop</span>}
                    </td>
                    <td className="px-5 py-3 text-ink-muted">
                      {TYPE_LABEL[e.listing_type ?? "event"] ?? "Event"}
                    </td>
                    <td className="px-5 py-3 text-ink-muted">
                      {e.starts_at ? formatDateShort(e.starts_at) : "—"}
                    </td>
                    <td className="px-5 py-3 text-ink-muted">
                      {sold}/{cap}
                    </td>
                    <td className="px-5 py-3 text-ink-muted">{formatPKR(rev)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={STATUS_TONE[e.status] ?? "neutral"}>{e.status}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/events/${e.id}/manifest`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-sky hover:underline"
                      >
                        <Users className="h-3.5 w-3.5" /> View
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/dashboard/events/${e.id}/edit`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft hover:text-sky"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Link>
                        {!cancelled && <CancelListingButton id={e.id} />}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}