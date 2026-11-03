"use client";

import { motion } from "framer-motion";
import { CalendarDays, MapPin, QrCode } from "lucide-react";
import { SearchBar } from "@/components/search-bar";

const stats = [
  { value: "3", label: "ways to gather" },
  { value: "10", label: "cities" },
  { value: "1 tap", label: "at the door" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-daylight">
      <div className="container-page grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left: the promise */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow"
          >
            Events, trips and activities across Pakistan
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 font-display text-display-xl font-semibold text-ink"
          >
            Something to look forward to.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 max-w-md text-lg leading-relaxed text-ink-muted"
          >
            Book a concert, a trip to the north, or a Sunday class — in seconds.
            Your phone is the ticket. No printing, no queues.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-8 max-w-xl"
          >
            <SearchBar />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex gap-10"
          >
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-display text-2xl font-semibold text-ink">{s.value}</p>
                <p className="text-sm text-ink-muted">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: the living ticket — the one bold moment */}
        <div className="relative mx-auto w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: -18, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="ticket-stub overflow-hidden rounded-3xl border border-mist bg-surface shadow-lift"
          >
            <div className="bg-sky px-7 py-6 text-white">
              <p className="text-sm font-medium text-white/80">Lahore Live</p>
              <p className="mt-1 font-display text-2xl font-semibold leading-tight">
                Winter Concert
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-white/85">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" /> Sat, 7:00 PM
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> Alhamra
                </span>
              </div>
            </div>

            <div className="perf-divide mx-7" />

            <div className="flex items-center justify-between gap-4 px-7 py-6">
              <div>
                <p className="text-xs text-ink-muted">Admit one</p>
                <p className="font-display text-lg font-semibold tracking-wide text-ink">
                  MHF-7K2P9Q<span className="sr-only"> sample ticket code</span>
                </p>
                <p className="mt-1 text-xs text-ink-muted">General · Rs 3,500</p>
              </div>
              <div className="grid h-20 w-20 place-content-center rounded-2xl bg-ink text-white">
                <QrCode className="h-10 w-10" />
              </div>
            </div>
          </motion.div>

          {/* The coral spark — rare, deliberate. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="absolute -bottom-4 -left-4 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white shadow-coral"
          >
            You&apos;re in 🎟
          </motion.div>
        </div>
      </div>
    </section>
  );
}