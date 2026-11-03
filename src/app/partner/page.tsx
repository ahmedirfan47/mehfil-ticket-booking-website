import { Sparkles, BadgeCheck, LayoutDashboard, Rocket } from "lucide-react";
import { BusinessForm } from "@/components/business-form";

export const metadata = {
  title: "Partner with Mehfil",
  description: "List your events, trips, and activities on Mehfil. Apply to join at launch.",
};

const PERKS = [
  { icon: Rocket, title: "Reach more guests", body: "Get in front of people actively looking for events, trips, and activities across Pakistan." },
  { icon: LayoutDashboard, title: "Your own dashboard", body: "Manage listings, sell tickets, scan at the door, and track sales — all in one place." },
  { icon: BadgeCheck, title: "Verified trust badge", body: "Approved businesses earn a verification badge buyers can see on every listing." },
];

export default function PartnerPage() {
  return (
    <main>
      <section className="border-b border-line bg-mesh-hero">
        <div className="container-page py-16 text-center">
          <span className="eyebrow justify-center">
            <Sparkles className="h-4 w-4" /> Partner with us
          </span>
          <h1 className="heading-display mx-auto mt-3 max-w-2xl text-4xl sm:text-5xl">
            List your events, trips &amp; activities on Mehfil
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-muted">
            We&apos;re onboarding businesses ahead of launch. Tell us about yourself — once
            approved, you get your own dashboard to start selling.
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {PERKS.map((p) => (
            <div key={p.title} className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <span className="grid h-10 w-10 place-content-center rounded-xl bg-primary-50 text-primary">
                <p.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 font-display text-base font-semibold text-ink">{p.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="mx-auto max-w-2xl">
          <BusinessForm />
        </div>
      </section>
    </main>
  );
}