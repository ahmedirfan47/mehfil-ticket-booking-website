import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Download, Users } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ORGANIZER_NAV } from "@/app/dashboard/page";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatDateShort } from "@/lib/utils";

export const metadata = { title: "Manifest" };
export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "valid" | "invalid" | "neutral"> = {
  valid: "valid",
  used: "neutral",
  cancelled: "invalid",
  refunded: "invalid",
};

export default async function ManifestPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/dashboard/events/${params.id}/manifest`);

  const { data: organizer } = await supabase
    .from("organizers")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!organizer) redirect("/dashboard");

  // The listing must belong to this organizer.
  const { data: event } = await supabase
    .from("events")
    .select("id, title, listing_type, starts_at, organizer_id")
    .eq("id", params.id)
    .maybeSingle();
  if (!event || event.organizer_id !== organizer.id) notFound();

  const { data: ticketData } = await supabase
    .from("tickets")
    .select("code, holder_name, holder_phone, holder_ref, status, created_at, ticket_type:ticket_types(name)")
    .eq("event_id", params.id)
    .order("created_at", { ascending: true });

  const tickets = (ticketData ?? []) as any[];
  const checkedIn = tickets.filter((t) => t.status === "used").length;

  const personWord = event.listing_type === "trip" ? "Travellers" : "Attendees";

  return (
    <DashboardShell title="Manifest" subtitle="Organizer" nav={ORGANIZER_NAV}>
      <div className="mb-4">
        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" /> Back to my events
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-content-center rounded-xl bg-primary-50 text-primary">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">{event.title}</p>
            <p className="text-xs text-ink-muted">
              {event.starts_at ? formatDateShort(event.starts_at) : "Date TBC"} · {tickets.length}{" "}
              {personWord.toLowerCase()} · {checkedIn} checked in
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">ID / ref</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Ticket</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-ink-muted">
                    No bookings yet.
                  </td>
                </tr>
              )}
              {tickets.map((t) => (
                <tr key={t.code} className="hover:bg-primary-50/40">
                  <td className="px-5 py-3 font-medium text-ink">{t.holder_name ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-muted">{t.holder_phone ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-muted">{t.holder_ref ?? "—"}</td>
                  <td className="px-5 py-3 text-ink-muted">{t.ticket_type?.name ?? "—"}</td>
                  <td className="px-5 py-3 font-mono text-xs text-ink-muted">{t.code}</td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[t.status] ?? "neutral"}>{t.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-ink-muted">
        <Download className="h-3.5 w-3.5" />
        Tip: use your browser&apos;s print (Ctrl+P) to save this manifest as a PDF for the door.
      </p>
    </DashboardShell>
  );
}