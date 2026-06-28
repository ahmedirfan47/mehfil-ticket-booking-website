import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { StatCard } from "@/components/dashboard-shell";
import { RevenueArea, CategoryPie } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPKR, formatDateShort } from "@/lib/utils";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

function monthKey(d: Date) {
  return d.toLocaleDateString("en-PK", { month: "short" });
}

export default async function AdminDashboard() {
  // Gate on the signed-in user's role using the RLS-scoped client.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return (
      <div className="min-h-screen bg-mesh-hero">
        <div className="mx-auto grid min-h-screen max-w-md place-content-center px-4 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-ink-muted" />
          <h1 className="heading-display mt-3 text-2xl">Admins only</h1>
          <p className="mt-2 text-sm text-ink-muted">
            This area is restricted to Mehfil platform administrators.
          </p>
          <Link href="/" className="mt-5 inline-flex items-center justify-center gap-2 text-sm font-medium text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to site
          </Link>
        </div>
      </div>
    );
  }

  // Platform-wide reads use the service role (admin verified above).
  const admin = createAdminClient();
  const [
    { count: eventCount },
    { count: publishedCount },
    { count: userCount },
    { count: organizerCount },
    { count: ticketCount },
    { data: orders },
    { data: events },
    { data: pendingOrgs },
  ] = await Promise.all([
    admin.from("events").select("*", { count: "exact", head: true }),
    admin.from("events").select("*", { count: "exact", head: true }).eq("status", "published"),
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("organizers").select("*", { count: "exact", head: true }),
    admin.from("tickets").select("*", { count: "exact", head: true }),
    admin.from("orders").select("amount_pkr, created_at, status").eq("status", "paid"),
    admin
      .from("events")
      .select("id, title, slug, status, starts_at, category:categories(name)")
      .order("created_at", { ascending: false })
      .limit(8),
    admin
      .from("organizers")
      .select("id, name, email, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const revenue = (orders ?? []).reduce((s, o: any) => s + (o.amount_pkr ?? 0), 0);

  const byMonth = new Map<string, number>();
  for (const o of orders ?? []) {
    const key = monthKey(new Date((o as any).created_at));
    byMonth.set(key, (byMonth.get(key) ?? 0) + ((o as any).amount_pkr ?? 0));
  }
  const trend = Array.from(byMonth, ([label, value]) => ({ label, value }));
  if (trend.length === 0) trend.push({ label: monthKey(new Date()), value: 0 });

  const byCategory = new Map<string, number>();
  for (const e of events ?? []) {
    const name = (e as any).category?.name ?? "Other";
    byCategory.set(name, (byCategory.get(name) ?? 0) + 1);
  }
  const pie = Array.from(byCategory, ([label, value]) => ({ label, value }));

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-white/80 backdrop-blur">
        <div className="container-page flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <span className="grid h-8 w-8 place-content-center rounded-lg bg-ink text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            Mehfil <span className="text-ink-muted">Admin</span>
          </Link>
          <span className="text-sm text-ink-muted">{profile?.full_name ?? user.email}</span>
        </div>
      </header>

      <main className="container-page py-10">
        <span className="eyebrow">Platform control</span>
        <h1 className="heading-display mt-2 text-3xl">Overview</h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Events" value={String(eventCount ?? 0)} hint={`${publishedCount ?? 0} live`} />
          <StatCard label="Users" value={String(userCount ?? 0)} />
          <StatCard label="Organizers" value={String(organizerCount ?? 0)} />
          <StatCard label="Tickets" value={String(ticketCount ?? 0)} />
          <StatCard label="Revenue" value={formatPKR(revenue)} />
          <StatCard label="Pending orgs" value={String(pendingOrgs?.length ?? 0)} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <h2 className="mb-2 font-display text-lg font-semibold text-ink">Revenue trend</h2>
            <RevenueArea data={trend} />
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <h2 className="mb-2 font-display text-lg font-semibold text-ink">Events by category</h2>
            <CategoryPie data={pie} />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Recent events</h2>
            <div className="divide-y divide-line">
              {(events ?? []).map((e: any) => (
                <div key={e.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link href={`/events/${e.slug}`} className="truncate font-medium text-ink hover:text-primary">
                      {e.title}
                    </Link>
                    <p className="text-xs text-ink-muted">
                      {e.starts_at ? formatDateShort(e.starts_at) : "Date TBC"} · {e.category?.name ?? "—"}
                    </p>
                  </div>
                  <Badge tone={e.status === "published" ? "valid" : "neutral"}>{e.status}</Badge>
                </div>
              ))}
              {(events ?? []).length === 0 && (
                <p className="py-6 text-center text-sm text-ink-muted">No events yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">
              Organizers awaiting approval
            </h2>
            <div className="divide-y divide-line">
              {(pendingOrgs ?? []).map((o: any) => (
                <div key={o.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{o.name}</p>
                    <p className="truncate text-xs text-ink-muted">{o.email ?? "—"}</p>
                  </div>
                  <Badge tone="accent">pending</Badge>
                </div>
              ))}
              {(pendingOrgs ?? []).length === 0 && (
                <p className="py-6 text-center text-sm text-ink-muted">
                  Nothing pending. All organizers are reviewed.
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-ink-muted">
          Approvals, bans, and content moderation run through Supabase RLS — admin mutations are
          scoped by the <code>current_role()</code> policies in <code>rls.sql</code>.
        </p>
      </main>
    </div>
  );
}