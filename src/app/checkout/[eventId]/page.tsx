import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { CheckoutForm } from "@/components/checkout-form";
import { getEventById } from "@/lib/queries";
import { formatEventDate } from "@/lib/utils";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage({ params }: { params: { eventId: string } }) {
  const event = await getEventById(params.eventId);
  if (!event || event.status !== "published") notFound();

  return (
    <main className="container-page py-10">
      <Link
        href={`/events/${event.slug}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to event
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <span className="eyebrow">Secure checkout</span>
          <h1 className="heading-display mt-2 text-3xl sm:text-4xl">{event.title}</h1>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              {formatEventDate(event.starts_at)}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {event.venue}
              {event.city ? `, ${event.city.name}` : ""}
            </span>
          </div>

          <div className="mt-8">
            <CheckoutForm event={event} />
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
            <div className="relative aspect-[4/3] bg-primary-50">
              {event.cover_url ? (
                <Image
                  src={event.cover_url}
                  alt={event.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full place-content-center text-primary/40">
                  <span className="font-display text-lg">Mehfil</span>
                </div>
              )}
            </div>
            <div className="space-y-2 p-6 text-sm text-ink-muted">
              <p className="font-display text-base font-semibold text-ink">{event.title}</p>
              <p>{formatEventDate(event.starts_at)}</p>
              <p>
                {event.venue}
                {event.city ? `, ${event.city.name}` : ""}
              </p>
              <div className="perf-divide my-4" />
              <p className="text-xs">
                Tickets are issued instantly with a unique QR code. Bring your phone — staff scan it
                at the door in one tap. No screenshots required.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}