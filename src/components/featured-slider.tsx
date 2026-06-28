"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatEventDate } from "@/lib/utils";
import type { EventWithRelations } from "@/lib/types";

export function FeaturedSlider({ events }: { events: EventWithRelations[] }) {
  const [index, setIndex] = useState(0);
  const count = events.length;

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count]
  );

  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(id);
  }, [count]);

  if (!count) return null;
  const event = events[index];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-ink shadow-card">
      <div className="relative aspect-[16/9] sm:aspect-[21/9]">
        <AnimatePresence mode="wait">
          <motion.div
            key={event.id}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            {event.cover_url && (
              <Image
                src={event.cover_url}
                alt={event.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 flex items-end">
          <div className="container-page pb-8 sm:pb-12">
            <div className="max-w-xl">
              {event.category && <Badge tone="accent">{event.category.name}</Badge>}
              <h2 className="mt-3 font-display text-2xl font-semibold text-white sm:text-4xl">
                {event.title}
              </h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-white/80">
                <MapPin className="h-4 w-4" />
                {event.venue}
                {event.city ? `, ${event.city.name}` : ""} · {formatEventDate(event.starts_at)}
              </p>
              <Link href={`/events/${event.slug}`} className="mt-5 inline-block">
                <Button variant="accent" size="lg">Get tickets</Button>
              </Link>
            </div>
          </div>
        </div>

        {count > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Previous"
              className="absolute right-16 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Next"
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 right-4 flex gap-1.5">
              {events.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-white" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}