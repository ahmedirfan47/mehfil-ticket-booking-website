import { CONTACT } from "@/lib/constants";

export const metadata = {
  title: "Terms of Service",
  description: "The terms for using Mehfil.",
};

export default function TermsPage() {
  return (
    <main className="container-page py-14">
      <div className="mx-auto max-w-2xl">
        <span className="eyebrow">Legal</span>
        <h1 className="heading-display mt-3 text-display-md">Terms of Service</h1>
        <p className="mt-2 text-sm text-ink-muted">Last updated: November 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink-soft">
          <p>
            {CONTACT.entityLine} By using Mehfil, you agree to these terms. We&apos;ve kept them
            short and readable.
          </p>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">Using Mehfil</h2>
            <p className="mt-3">
              Mehfil is a platform where businesses list events, trips and activities, and guests
              book them. You agree to use the service lawfully and to provide accurate information
              when you sign up, book, or apply to list.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">For organizers</h2>
            <p className="mt-3">
              Businesses must be reviewed and approved before listing. You are responsible for the
              accuracy of your listings, for delivering what you advertise, and for honouring the
              bookings guests make. Listings that are misleading or unlawful may be removed.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">For guests</h2>
            <p className="mt-3">
              When you book, you enter an agreement with the organizer running that event, trip or
              activity. Your ticket is tied to a unique code and is valid for a single entry. The
              organizer sets the rules, timing and any cancellation or refund terms for their
              listing.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">Tickets and entry</h2>
            <p className="mt-3">
              Each ticket carries a QR code that is scanned once at the door. Do not share your
              ticket — once it has been scanned, it cannot be used again.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">Changes and contact</h2>
            <p className="mt-3">
              We may update these terms as the service grows; material changes will be posted here.
              Questions? Email{" "}
              <a href={`mailto:${CONTACT.email}`} className="text-sky hover:underline">
                {CONTACT.email}
              </a>
              .
            </p>
          </section>

          <p className="rounded-2xl border border-mist bg-white p-4 text-xs text-ink-muted">
            These terms are a good-faith starting point. Before we process real payments, we will
            have them reviewed by a qualified lawyer and update them to cover payments, refunds and
            liability in full.
          </p>
        </div>
      </div>
    </main>
  );
}