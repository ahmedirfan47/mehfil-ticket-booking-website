import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarPlus,
  LayoutDashboard,
  CalendarDays,
  Plus,
  Crown,
} from "lucide-react";
import { DashboardShell, StatCard, type NavItem } from "@/components/dashboard-shell";
import { RevenueArea } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatPKR, formatDateShort } from "@/lib/utils";

export const metadata = { title: "Organizer dashboard" };
export const dynamic = "force-dynamic";

export const ORGANIZER_NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/events", label: "My events", icon: CalendarDays },
  { href: "/dashboard/events/new", label: "Create event", icon: CalendarPlus },
];

const PLAN_LABEL: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  unlimited: "Unlimited",
};

function monthKey(d: Date) {
  return d.toLocaleDateString("en-PK", { month: "short" });
}

export default async function OrganizerDashboard() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: organizer } = await supabase
    .from("organizers")
    .select("id, name, status, plan")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!organizer) {
    return (
      <DashboardShell title="Become an organizer" subtitle="Organizer" nav={ORGANIZER_NAV}>
        <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-card">
          <p className="font-display text-lg font-semibold text-ink">
            You don&apos;t have an organizer profile yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            Organizer accounts are approved by the Mehfil team. Once approved, you can create
            events, sell tickets, and manage your door staff from here.
          </p>
        </div>
      </DashboardShell>
    );
  }

  const { data: events } = await supabase
    .from("events")
    .select("id, title, slug, status, starts_at, created_at, ticket_types(price_pkr, quantity_total, quantity_sold)")
    .eq("organizer_id", organizer.id)
    .order("starts_at", { ascending: false });

  const list = (events ?? []) as any[];
  const eventIds = list.map((e) => e.id);

  // Plan usage: events created in the current calendar month.
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const usedThisMonth = list.filter(
    (e) => e.created_at && new Date(e.created_at) >= monthStart
  ).length;
  const plan = (organizer.plan as string) ?? "free";
  const planLimit = plan === "free" ? 3 : plan === "pro" ? 20 : null; // null = unlimited
  const atLimit = planLimit !== null && usedThisMonth >= planLimit;

  let ticketsSold = 0;
  let revenue = 0;
  for (const e of list) {
    for (const t of e.ticket_types ?? []) {
      ticketsSold += t.quantity_sold;
      revenue += t.quantity_sold * t.price_pkr;
    }
  }

  // Revenue trend by month from real orders for these events.
  const trend: { label: string; value: number }[] = [];
  if (eventIds.length) {
    const { data: orders } = await supabase
      .from("orders")
      .select("amount_pkr, created_at, status")
      .in("event_id", eventIds)
      .eq("status", "paid");
    const byMonth = new Map<string, number>();
    for (const o of orders ?? []) {
      const key = monthKey(new Date(o.created_at));
      byMonth.set(key, (byMonth.get(key) ?? 0) + (o.amount_pkr ?? 0));
    }
    for (const [label, value] of byMonth) trend.push({ label, value });
  }
  if (trend.length === 0) {
    trend.push({ label: monthKey(new Date()), value: revenue });
  }

  const published = list.filter((e) => e.status === "published").length;

  return (
    <DashboardShell
      title={organizer.name}
      subtitle={organizer.status === "approved" ? "Organizer" : `Organizer · ${organizer.status}`}
      nav={ORGANIZER_NAV}
    >
      {/* Subscription plan card */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-content-center rounded-xl bg-primary-50 text-primary">
            <Crown className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">
              {PLAN_LABEL[plan] ?? "Free"} plan
            </p>
            <p className="text-xs text-ink-muted">
              {planLimit === null
                ? `${usedThisMonth} events this month · unlimited`
                : `${usedThisMonth} of ${planLimit} events used this month`}
              {atLimit ? " · limit reached" : ""}
            </p>
          </div>
        </div>
        <Link href="/pricing">
          <Button size="sm" variant={atLimit ? "primary" : "outline"}>
            {plan === "unlimited" ? "Manage plan" : "Upgrade plan"}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total events" value={String(list.length)} hint={`${published} published`} />
        <StatCard label="Tickets sold" value={ticketsSold.toLocaleString("en-PK")} />
        <StatCard label="Revenue" value={formatPKR(revenue)} hint="Paid orders" />
        <StatCard
          label="Upcoming"
          value={String(
            list.filter((e) => e.starts_at && new Date(e.starts_at) > new Date()).length
          )}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Revenue</h2>
          <Link href="/dashboard/events/new">
            <Button size="sm" variant="primary">
              <Plus className="mr-1.5 h-4 w-4" /> New event
            </Button>
          </Link>
        </div>
        <RevenueArea data={trend} />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
        <h2 className="mb-4 font-display text-lg font-semibold text-ink">Recent events</h2>
        {list.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">
            No events yet.{" "}
            <Link href="/dashboard/events/new" className="font-medium text-primary">
              Create your first event
            </Link>
            .
          </p>
        ) : (
          <div className="divide-y divide-line">
            {list.slice(0, 6).map((e) => {
              const sold = (e.ticket_types ?? []).reduce(
                (s: number, t: any) => s + t.quantity_sold,
                0
              );
              const cap = (e.ticket_types ?? []).reduce(
                (s: number, t: any) => s + t.quantity_total,
                0
              );
              return (
                <div key={e.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{e.title}</p>
                    <p className="text-xs text-ink-muted">
                      {e.starts_at ? formatDateShort(e.starts_at) : "Date TBC"} · {sold}/{cap} sold
                    </p>
                  </div>
                  <Badge tone={e.status === "published" ? "valid" : "neutral"}>{e.status}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}