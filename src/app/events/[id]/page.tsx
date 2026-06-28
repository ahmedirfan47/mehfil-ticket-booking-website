import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  CalendarDays,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Ticket as TicketIcon,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getEventBySlug } from "@/lib/queries";
import { formatEventDate, formatPKR, lowestPrice, remaining } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const event = await getEventBySlug(params.id);
  if (!event) return { title: "Event not found" };
  return { title: event.title, description: event.summary ?? undefined };
}

export default async function EventDetailsPage({ params }: { params: { id: string } }) {
  const event = await getEventBySlug(params.id);
  if (!event || event.status !== "published") notFound();

  const left = remaining(event.ticket_types);
  const price = lowestPrice(event.ticket_types);
  const mapsUrl =
    event.latitude && event.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${event.venue ?? ""} ${event.address ?? ""}`
        )}`;

  return (
    <article>
      {/* Cover */}
      <div className="relative h-[42vh] min-h-[320px] w-full overflow-hidden">
        {event.cover_url && (
          <Image src={event.cover_url} alt={event.title} fill priority className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="container-page pb-8">
            <div className="flex flex-wrap gap-2">
              {event.category && <Badge tone="primary">{event.category.name}</Badge>}
              {event.is_workshop && <Badge tone="accent">Workshop</Badge>}
              {event.is_free && <Badge tone="valid">Free entry</Badge>}
            </div>
            <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold text-white sm:text-5xl">
              {event.title}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/85">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" /> {formatEventDate(event.starts_at)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {event.venue}
                {event.city ? `, ${event.city.name}` : ""}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_360px]">
        {/* Main column */}
        <div className="space-y-10">
          <section>
            <h2 className="heading-display text-2xl">About this event</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-ink-soft">
              {event.description}
            </p>
          </section>

          {event.gallery.length > 0 && (
            <section>
              <h2 className="heading-display text-2xl">Gallery</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {event.gallery.map((src, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-2xl">
                    <Image src={src} alt={`${event.title} ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="heading-display text-2xl">Location</h2>
            <Card className="mt-4 p-6">
              <p className="flex items-center gap-2 font-medium text-ink">
                <MapPin className="h-5 w-5 text-primary" /> {event.venue}
              </p>
              <p className="mt-1 text-sm text-ink-muted">{event.address}</p>
              <Link href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="mt-4">
                  Open in Google Maps
                </Button>
              </Link>
            </Card>
          </section>

          {event.rules && (
            <section>
              <h2 className="heading-display text-2xl">Rules</h2>
              <Card className="mt-4 flex gap-3 p-6">
                <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                <p className="whitespace-pre-line text-sm text-ink-soft">{event.rules}</p>
              </Card>
            </section>
          )}

          {event.faqs.length > 0 && (
            <section>
              <h2 className="heading-display text-2xl">FAQs</h2>
              <div className="mt-4 space-y-3">
                {event.faqs.map((f, i) => (
                  <details
                    key={i}
                    className="group rounded-2xl border border-line bg-surface p-5 shadow-card"
                  >
                    <summary className="cursor-pointer list-none font-medium text-ink">
                      {f.q}
                    </summary>
                    <p className="mt-2 text-sm text-ink-muted">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sticky buy panel */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="ticket-stub p-6">
            <p className="text-sm text-ink-muted">Tickets from</p>
            <p className="font-display text-3xl font-semibold text-ink">{formatPKR(price)}</p>

            <div className="mt-5 space-y-3">
              {event.ticket_types
                .filter((t) => t.is_active)
                .map((t) => {
                  const tLeft = t.quantity_total - t.quantity_sold;
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between rounded-xl border border-line p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-ink">{t.name}</p>
                        <p className="text-xs text-ink-muted">
                          {tLeft > 0 ? `${tLeft} left` : "Sold out"}
                        </p>
                      </div>
                      <p className="font-semibold text-ink">{formatPKR(t.price_pkr)}</p>
                    </div>
                  );
                })}
            </div>

            <Link href={`/checkout/${event.id}`} className="mt-5 block">
              <Button size="lg" className="w-full" disabled={left === 0}>
                <TicketIcon className="h-5 w-5" />
                {left === 0 ? "Sold out" : "Buy tickets"}
              </Button>
            </Link>

            <div className="mt-6 space-y-2 border-t border-line pt-5 text-sm text-ink-muted">
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Doors:{" "}
                {formatEventDate(event.starts_at)}
              </p>
              {event.organizer && (
                <p className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> By {event.organizer.name}
                </p>
              )}
              {event.organizer_contact && (
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" /> {event.organizer_contact}
                </p>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </article>
  );
}