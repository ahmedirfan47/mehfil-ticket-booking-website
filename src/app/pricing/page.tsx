import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { UpgradeButton } from "@/components/upgrade-button";

export const metadata = { title: "Pricing" };
export const dynamic = "force-dynamic";

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "Rs 0",
    cadence: "forever",
    tagline: "Get started and list your first events.",
    features: ["3 events per month", "QR ticketing", "Staff scanner", "Basic dashboard"],
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$15",
    cadence: "per month",
    tagline: "For active organizers running regular events.",
    features: [
      "20 events per month",
      "Everything in Free",
      "Revenue analytics",
      "Priority listing",
    ],
    highlight: true,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: "$35",
    cadence: "per month",
    tagline: "For venues and agencies at full scale.",
    features: [
      "Unlimited events",
      "Everything in Pro",
      "Featured placement",
      "Dedicated support",
    ],
    highlight: false,
  },
] as const;

export default async function PricingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentPlan: string | null = null;
  let isOrganizer = false;
  if (user) {
    const { data: organizer } = await supabase
      .from("organizers")
      .select("plan")
      .eq("user_id", user.id)
      .maybeSingle();
    if (organizer) {
      isOrganizer = true;
      currentPlan = organizer.plan as string;
    }
  }

  return (
    <main className="container-page py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="eyebrow justify-center">For organizers</span>
        <h1 className="heading-display mt-3 text-4xl sm:text-5xl">Simple, honest pricing</h1>
        <p className="mt-4 text-lg text-ink-muted">
          List events, sell tickets, and scan at the door. Upgrade any time as you grow.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-3">
        {TIERS.map((tier) => {
          const isCurrent = currentPlan === tier.id;
          return (
            <div
              key={tier.id}
              className={
                "relative flex flex-col rounded-3xl border bg-white p-7 shadow-card " +
                (tier.highlight ? "border-primary ring-1 ring-primary" : "border-line")
              }
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-7 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h2 className="font-display text-xl font-semibold text-ink">{tier.name}</h2>
              <p className="mt-1 text-sm text-ink-muted">{tier.tagline}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className="font-display text-4xl font-semibold text-ink">{tier.price}</span>
                <span className="mb-1 text-sm text-ink-muted">/ {tier.cadence}</span>
              </div>

              <ul className="mt-6 space-y-3 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-ink-soft">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-valid" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                {!user ? (
                  <Link
                    href={`/login?next=/pricing`}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-white"
                  >
                    Sign in to choose
                  </Link>
                ) : !isOrganizer ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-line px-5 text-sm font-medium text-ink"
                  >
                    Become an organizer
                  </Link>
                ) : isCurrent ? (
                  <span className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary-50 px-5 text-sm font-medium text-primary">
                    Current plan
                  </span>
                ) : (
                  <UpgradeButton plan={tier.id} label={`Switch to ${tier.name}`} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mx-auto mt-10 max-w-xl text-center text-xs text-ink-muted">
        Paid plans are billed monthly. Payment integration is being finalised — for now, plan
        changes apply instantly so you can try each tier.
      </p>
    </main>
  );
}