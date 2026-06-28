import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ORGANIZER_NAV } from "@/app/dashboard/page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
          "id, title, slug, status, starts_at, is_workshop, ticket_types(price_pkr, quantity_total, quantity_sold)"
        )
        .eq("organizer_id", organizer.id)
        .order("starts_at", { ascending: false })
    : { data: [] as any[] };

  const list = (events ?? []) as any[];

  return (
    <DashboardShell title="My events" subtitle="Organizer" nav={ORGANIZER_NAV}>
      <div className="mb-4 flex justify-end">
        <Link href="/dashboard/events/new">
          <Button variant="primary" size="sm">
            <Plus className="mr-1.5 h-4 w-4" /> Create event
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Event</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Sold</th>
                <th className="px-5 py-3 font-medium">Revenue</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-ink-muted">
                    No events yet. Create your first one to start selling tickets.
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
                return (
                  <tr key={e.id} className="hover:bg-primary-50/40">
                    <td className="px-5 py-3">
                      <Link href={`/events/${e.slug}`} className="font-medium text-ink hover:text-primary">
                        {e.title}
                      </Link>
                      {e.is_workshop && <span className="ml-2 text-xs text-ink-muted">Workshop</span>}
                    </td>
                    <td className="px-5 py-3 text-ink-muted">
                      {e.starts_at ? formatDateShort(e.starts_at) : "—"}
                    </td>
                    <td className="px-5 py-3 text-ink-muted">
                      {sold}/{cap}
                    </td>
                    <td className="px-5 py-3 text-ink-muted">{formatPKR(rev)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={e.status === "published" ? "valid" : "neutral"}>{e.status}</Badge>
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