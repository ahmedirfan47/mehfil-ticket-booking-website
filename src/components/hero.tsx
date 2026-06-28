"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SearchBar } from "@/components/search-bar";

const stats = [
  { value: "10", label: "Cities" },
  { value: "13", label: "Categories" },
  { value: "1-tap", label: "Door entry" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-mesh-hero">
      <div className="container-page py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="eyebrow justify-center">
            <Sparkles className="h-4 w-4" /> Live across Pakistan
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Find your next{" "}
            <span className="relative whitespace-nowrap text-primary">
              mehfil
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                aria-hidden
              >
                <path
                  d="M2 9C75 3 225 3 298 9"
                  stroke="#FF6B4A"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-ink-muted">
            Concerts, workshops, festivals and tech meetups — booked in seconds,
            scanned at the door. No printing, no queues.
          </p>

          <div className="mt-8 flex justify-center">
            <SearchBar />
          </div>

          <div className="mt-10 flex items-center justify-center gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-2xl font-semibold text-ink">{s.value}</p>
                <p className="text-xs uppercase tracking-wide text-ink-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}