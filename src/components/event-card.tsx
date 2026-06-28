import Link from "next/link";
import Image from "next/image";
import { CalendarDays, MapPin, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatEventDate, formatPKR, lowestPrice, remaining } from "@/lib/utils";
import type { EventWithRelations } from "@/lib/types";

export function EventCard({ event }: { event: EventWithRelations }) {
  const left = remaining(event.ticket_types);
  const price = lowestPrice(event.ticket_types);
  const lowStock = left > 0 && left <= 25;

  return (
    <Link href={`/events/${event.slug}`} className="group block">
      <article className="ticket-stub overflow-hidden rounded-3xl border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
        <div className="relative aspect-[16/10] overflow-hidden">
          {event.cover_url ? (
            <Image
              src={event.cover_url}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, 360px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-primary-50" />
          )}
          <div className="absolute left-3 top-3 flex gap-2">
            {event.category && <Badge tone="primary">{event.category.name}</Badge>}
            {event.is_free && <Badge tone="valid">Free</Badge>}
          </div>
          {lowStock && (
            <div className="absolute right-3 top-3">
              <Badge tone="accent">{left} left</Badge>
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="line-clamp-2 font-display text-lg font-semibold leading-snug text-ink group-hover:text-primary">
            {event.title}
          </h3>

          <div className="mt-3 space-y-1.5 text-sm text-ink-muted">
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
              {formatEventDate(event.starts_at)}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="line-clamp-1">
                {event.venue}
                {event.city ? `, ${event.city.name}` : ""}
              </span>
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <div>
              <p className="text-xs text-ink-muted">From</p>
              <p className="font-display text-lg font-semibold text-ink">{formatPKR(price)}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted">
              <Ticket className="h-4 w-4" />
              {left > 0 ? `${left} available` : "Sold out"}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}