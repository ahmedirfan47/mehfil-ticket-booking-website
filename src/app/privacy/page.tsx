import { CONTACT } from "@/lib/constants";

export const metadata = {
  title: "Privacy Policy",
  description: "How Mehfil handles your data.",
};

export default function PrivacyPage() {
  return (
    <main className="container-page py-14">
      <div className="mx-auto max-w-2xl">
        <span className="eyebrow">Legal</span>
        <h1 className="heading-display mt-3 text-display-md">Privacy Policy</h1>
        <p className="mt-2 text-sm text-ink-muted">Last updated: November 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink-soft">
          <p>
            {CONTACT.entityLine} This policy explains what information we collect, why, and how you
            can reach us about it. We keep it in plain language on purpose.
          </p>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">What we collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <span className="font-medium text-ink">Waitlist email.</span> If you join our
                waitlist, we store your email address so we can tell you when we launch.
              </li>
              <li>
                <span className="font-medium text-ink">Account details.</span> If you sign up, we
                store your name, email, and (if you add it) your phone number.
              </li>
              <li>
                <span className="font-medium text-ink">Business applications.</span> If you apply to
                list with us, we store the business and contact details you submit.
              </li>
              <li>
                <span className="font-medium text-ink">Booking details.</span> When you book, we
                store the order and the attendee details you provide so the organizer can prepare
                for you and verify entry at the door.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">How we use it</h2>
            <p className="mt-3">
              We use your information to run the service: to send launch and account updates, to let
              organizers manage their events and guests, and to issue and check tickets. We do not
              sell your personal data.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">Who can see it</h2>
            <p className="mt-3">
              When you book an event, trip or activity, the organizer running it can see the
              attendee details for that booking so they can admit you and prepare for your visit.
              Our technical providers (for hosting and database) process data on our behalf to keep
              the service running.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">Your choices</h2>
            <p className="mt-3">
              You can ask us to remove your email from the waitlist or delete your account data at
              any time. Email us at{" "}
              <a href={`mailto:${CONTACT.email}`} className="text-sky hover:underline">
                {CONTACT.email}
              </a>{" "}
              and we&apos;ll take care of it.
            </p>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink">Contact</h2>
            <p className="mt-3">
              Questions about privacy? Reach us at{" "}
              <a href={`mailto:${CONTACT.email}`} className="text-sky hover:underline">
                {CONTACT.email}
              </a>
              . We&apos;re based in {CONTACT.city}.
            </p>
          </section>

          <p className="rounded-2xl border border-mist bg-white p-4 text-xs text-ink-muted">
            This policy is a good-faith starting point written in plain language. Before we process
            real payments, we will have it reviewed by a qualified lawyer and update it to meet all
            applicable requirements.
          </p>
        </div>
      </div>
    </main>
  );
}