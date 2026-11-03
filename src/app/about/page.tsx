import Link from "next/link";
import { MapPin, Ticket, ShieldCheck } from "lucide-react";
import { CONTACT } from "@/lib/constants";

export const metadata = {
  title: "About",
  description: "Mehfil is a booking platform for events, trips and activities across Pakistan.",
};

export default function AboutPage() {
  return (
    <main>
      <section className="border-b border-mist bg-daylight">
        <div className="container-page py-16">
          <span className="eyebrow">About Mehfil</span>
          <h1 className="heading-display mt-3 max-w-2xl text-display-lg">
            Making it simple to find — and run — the things worth showing up for.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
            Mehfil brings events, trips and activities across Pakistan into one place. People book
            in seconds and walk in with their phone. Organizers get the tools to sell tickets,
            manage bookings, and scan guests at the door — without the usual mess.
          </p>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-mist bg-white p-6 shadow-card">
            <span className="grid h-10 w-10 place-content-center rounded-xl bg-sky-50 text-sky">
              <Ticket className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink">Book in seconds</h2>
            <p className="mt-2 text-sm text-ink-muted">
              No printing, no queues. Your ticket is a QR code on your phone, scanned at the door in
              one tap.
            </p>
          </div>
          <div className="rounded-2xl border border-mist bg-white p-6 shadow-card">
            <span className="grid h-10 w-10 place-content-center rounded-xl bg-sky-50 text-sky">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink">Built on trust</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Businesses are reviewed before they can sell. Verified organizers carry a badge buyers
              can see on every listing.
            </p>
          </div>
          <div className="rounded-2xl border border-mist bg-white p-6 shadow-card">
            <span className="grid h-10 w-10 place-content-center rounded-xl bg-sky-50 text-sky">
              <MapPin className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-display text-lg font-semibold text-ink">Starting in Punjab</h2>
            <p className="mt-2 text-sm text-ink-muted">
              We&apos;re launching across Punjab first — Lahore, Faisalabad, Multan and beyond — then
              growing from there.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-3xl border border-mist bg-white p-8 shadow-card">
          <h2 className="font-display text-xl font-semibold text-ink">Who&apos;s behind Mehfil</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {CONTACT.entityLine} We&apos;re based in {CONTACT.city}, building the booking layer for
            Pakistan&apos;s events, travel and experiences. Questions, partnerships, or feedback —
            we&apos;d like to hear from you.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/partner"
              className="inline-flex h-11 items-center rounded-full bg-sky px-6 text-sm font-semibold text-white transition hover:bg-sky-600"
            >
              Partner with us
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center rounded-full border border-mist px-6 text-sm font-semibold text-ink transition hover:border-sky/40"
            >
              Contact
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}