import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, ArrowLeft, Mail } from "lucide-react";
import { StatCard } from "@/components/dashboard-shell";
import { RevenueArea, CategoryPie } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { VerificationReview } from "@/components/verification-review";
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
    { count: waitlistCount },
    { data: orders },
    { data: events },
    { data: pendingOrgs },
    { data: pendingVerifs },
    { data: waitlist },
  ] = await Promise.all([
    admin.from("events").select("*", { count: "exact", head: true }),
    admin.from("events").select("*", { count: "exact", head: true }).eq("status", "published"),
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("organizers").select("*", { count: "exact", head: true }),
    admin.from("tickets").select("*", { count: "exact", head: true }),
    admin.from("waitlist").select("*", { count: "exact", head: true }),
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
    admin
      .from("organizer_verifications")
      .select("id, legal_name, business_email, phone, website, facebook, instagram, linkedin, notes, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10),
    admin
      .from("waitlist")
      .select("email, created_at, notified")
      .order("created_at", { ascending: false })
      .limit(20),
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
  const verifs = (pendingVerifs ?? []) as any[];
  const waitRows = (waitlist ?? []) as any[];

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
          <StatCard label="Waitlist" value={String(waitlistCount ?? 0)} />
          <StatCard label="Verifications" value={String(verifs.length)} hint="pending" />
        </div>

        {/* Waitlist */}
        <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-ink">
              Launch waitlist ({waitlistCount ?? 0})
            </h2>
          </div>
          {waitRows.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-muted">No signups yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                    <th className="px-3 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">Joined</th>
                    <th className="px-3 py-2 font-medium">Notified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {waitRows.map((w) => (
                    <tr key={w.email}>
                      <td className="px-3 py-2 font-medium text-ink">{w.email}</td>
                      <td className="px-3 py-2 text-ink-muted">
                        {w.created_at ? formatDateShort(w.created_at) : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <Badge tone={w.notified ? "valid" : "neutral"}>
                          {w.notified ? "sent" : "pending"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-ink-muted">
                Showing the 20 most recent of {waitlistCount ?? 0}. Full export and launch email
                come with the email integration.
              </p>
            </div>
          )}
        </div>

        {/* Verification review queue */}
        <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-card">
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">
            Organizer verifications
          </h2>
          {verifs.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-muted">
              No verification requests waiting.
            </p>
          ) : (
            <div className="space-y-4">
              {verifs.map((v) => (
                <div key={v.id} className="rounded-xl border border-line p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{v.legal_name}</p>
                      <p className="text-xs text-ink-muted">
                        {v.business_email} · {v.phone}
                        {v.created_at ? ` · ${formatDateShort(v.created_at)}` : ""}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        {v.website && (
                          <a href={v.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Website
                          </a>
                        )}
                        {v.facebook && (
                          <a href={v.facebook} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Facebook
                          </a>
                        )}
                        {v.instagram && (
                          <a href={v.instagram} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Instagram
                          </a>
                        )}
                        {v.linkedin && (
                          <a href={v.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            LinkedIn
                          </a>
                        )}
                      </div>
                      {v.notes && <p className="mt-2 text-xs text-ink-soft">{v.notes}</p>}
                    </div>
                    <VerificationReview id={v.id} />
                  </div>
                </div>
              ))}
            </div>
          )}
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
          Approvals and moderation run through Supabase RLS &mdash; admin mutations are scoped by
          the <code>mehfil_role()</code> policies in <code>rls.sql</code>.
        </p>
      </main>
    </div>
  );
}