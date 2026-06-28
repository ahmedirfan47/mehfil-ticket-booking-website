import Link from "next/link";
import { redirect } from "next/navigation";
import { Ticket as TicketIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TicketView, type PrintedTicketData } from "@/components/ticket-view";
import { EmptyState } from "@/components/empty-state";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "My tickets" };
export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "valid" | "invalid" | "neutral"> = {
  valid: "valid",
  used: "neutral",
  cancelled: "invalid",
  refunded: "invalid",
};

export default async function MyTicketsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/tickets");

  const { data } = await supabase
    .from("tickets")
    .select(
      `id, code, qr_token, holder_name, seat_label, status, order_id,
       event:events(title, venue, starts_at),
       ticket_type:ticket_types(name)`
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  const tickets = (data ?? []) as any[];

  return (
    <main className="container-page py-10">
      <span className="eyebrow">Your wallet</span>
      <h1 className="heading-display mt-2 text-3xl sm:text-4xl">My tickets</h1>
      <p className="mt-2 max-w-xl text-ink-muted">
        Every ticket you’ve bought, ready to scan at the door. Tap print to save a PDF copy.
      </p>

      {tickets.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="No tickets yet"
            description="When you book an event, your tickets land here instantly."
          />
          <div className="mt-6 text-center">
            <Link
              href="/events"
              className="inline-flex h-10 items-center rounded-xl bg-primary px-5 text-sm font-medium text-white"
            >
              Browse events
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((t) => {
            const printed: PrintedTicketData = {
              code: t.code,
              qr_token: t.qr_token,
              holder_name: t.holder_name ?? "",
              event_title: t.event?.title ?? "Event",
              venue: t.event?.venue ?? null,
              starts_at: t.event?.starts_at ?? null,
              seat_label: t.seat_label,
              order_number: t.order_id,
              ticket_type: t.ticket_type?.name ?? null,
            };
            return (
              <div key={t.id} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
                    <TicketIcon className="h-3.5 w-3.5" />
                    {t.code}
                  </span>
                  <Badge tone={STATUS_TONE[t.status] ?? "neutral"}>{t.status}</Badge>
                </div>
                <TicketView ticket={printed} />
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}