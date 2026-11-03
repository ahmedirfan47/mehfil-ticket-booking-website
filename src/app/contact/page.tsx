import { Mail, MapPin, Store } from "lucide-react";
import { CONTACT } from "@/lib/constants";

export const metadata = {
  title: "Contact",
  description: "Get in touch with the Mehfil team.",
};

export default function ContactPage() {
  return (
    <main>
      <section className="border-b border-mist bg-daylight">
        <div className="container-page py-16">
          <span className="eyebrow">Contact</span>
          <h1 className="heading-display mt-3 text-display-md">We&apos;d like to hear from you</h1>
          <p className="mt-4 max-w-xl text-ink-muted">
            Whether you&apos;re a guest with a question or a business wanting to list with us, reach
            out and we&apos;ll get back to you.
          </p>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
          <a
            href={`mailto:${CONTACT.email}`}
            className="group rounded-2xl border border-mist bg-white p-6 shadow-card transition hover:border-sky/40"
          >
            <span className="grid h-10 w-10 place-content-center rounded-xl bg-sky-50 text-sky">
              <Mail className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink">Email us</h2>
            <p className="mt-1 text-sm text-sky group-hover:underline">{CONTACT.email}</p>
          </a>

          <div className="rounded-2xl border border-mist bg-white p-6 shadow-card">
            <span className="grid h-10 w-10 place-content-center rounded-xl bg-sky-50 text-sky">
              <MapPin className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink">Based in</h2>
            <p className="mt-1 text-sm text-ink-muted">{CONTACT.city}</p>
          </div>

          <div className="rounded-2xl border border-mist bg-white p-6 shadow-card sm:col-span-2">
            <span className="grid h-10 w-10 place-content-center rounded-xl bg-coral-50 text-coral">
              <Store className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink">For businesses</h2>
            <p className="mt-1 max-w-xl text-sm text-ink-muted">
              Want to list your events, trips or activities? The fastest way to start is our partner
              application — tell us about your business and we&apos;ll review it.
            </p>
            <a
              href="/partner"
              className="mt-4 inline-flex h-10 items-center rounded-full bg-sky px-5 text-sm font-semibold text-white transition hover:bg-sky-600"
            >
              Apply to partner
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}