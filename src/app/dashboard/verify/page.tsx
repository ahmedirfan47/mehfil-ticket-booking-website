import { redirect } from "next/navigation";
import { ShieldCheck, Clock, XCircle, BadgeCheck } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { ORGANIZER_NAV } from "@/app/dashboard/page";
import { VerifyForm } from "@/components/verify-form";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Get verified" };
export const dynamic = "force-dynamic";

export default async function VerifyPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/verify");

  const { data: organizer } = await supabase
    .from("organizers")
    .select("id, name, email, phone, website, verification")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!organizer) redirect("/dashboard");

  const status = (organizer.verification as string) ?? "unverified";

  if (status === "approved") {
    return (
      <DashboardShell title="Verification" subtitle="Organizer" nav={ORGANIZER_NAV}>
        <div className="rounded-2xl border border-valid/30 bg-valid/5 p-8 text-center shadow-card">
          <BadgeCheck className="mx-auto h-10 w-10 text-valid" />
          <p className="mt-3 font-display text-lg font-semibold text-ink">You&apos;re verified</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">
            Buyers now see a verified badge on your events. Thanks for helping keep Mehfil safe.
          </p>
        </div>
      </DashboardShell>
    );
  }

  if (status === "pending") {
    return (
      <DashboardShell title="Verification" subtitle="Organizer" nav={ORGANIZER_NAV}>
        <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-card">
          <Clock className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-3 font-display text-lg font-semibold text-ink">Under review</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">
            Your details are being reviewed by our team. This usually takes 1&ndash;2 business days.
          </p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Get verified" subtitle="Organizer" nav={ORGANIZER_NAV}>
      {status === "rejected" && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-invalid/30 bg-invalid/5 p-4">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-invalid" />
          <p className="text-sm text-ink-soft">
            Your last submission wasn&apos;t approved. Please review your details and submit again.
          </p>
        </div>
      )}
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-line bg-primary-50/50 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <p className="text-sm text-ink-soft">
          Verified organizers earn a trust badge that buyers see on every event. Submit your
          business and social details below &mdash; no ID documents required.
        </p>
      </div>
      <VerifyForm
        defaults={{
          legal_name: organizer.name ?? "",
          business_email: organizer.email ?? "",
          phone: organizer.phone ?? "",
          website: organizer.website ?? "",
        }}
      />
    </DashboardShell>
  );
}