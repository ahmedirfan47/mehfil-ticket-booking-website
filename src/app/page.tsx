import { Hero } from "@/components/hero";
import { FeaturedSlider } from "@/components/featured-slider";
import { EventCard } from "@/components/event-card";
import { CategoryGrid } from "@/components/category-grid";
import { CityGrid } from "@/components/city-grid";
import { SectionHeader } from "@/components/section-header";
import { EmptyState } from "@/components/empty-state";
import { WaitlistForm } from "@/components/waitlist-form";
import { Sparkles, Store } from "lucide-react";
import Link from "next/link";
import {
  getFeaturedEvents,
  getEvents,
  getCities,
  getCategories,
} from "@/lib/queries";

// Revalidate the homepage every 60s (ISR) — fast loads, fresh content.
export const revalidate = 60;

export default async function HomePage() {
  const [featured, trending, upcoming, workshops, cities, categories] =
    await Promise.all([
      getFeaturedEvents(5),
      getEvents({ limit: 8, orderBy: "created_at" }),
      getEvents({ limit: 8, orderBy: "starts_at" }),
      getEvents({ limit: 4, workshopsOnly: true }),
      getCities(),
      getCategories(),
    ]);

  return (
    <>
      {/* Launch waitlist band */}
      <section className="border-b border-mist bg-daylight">
        <div className="container-page py-12 text-center">
          <span className="eyebrow justify-center">
            <Sparkles className="h-4 w-4" /> Launching soon
          </span>
          <h2 className="heading-display mx-auto mt-3 max-w-2xl text-display-md">
            Be first through the door when Mehfil goes live
          </h2>
          <p className="mx-auto mt-3 max-w-md text-ink-muted">
            Join the waitlist and we&apos;ll email you the moment tickets, trips, and activities go
            on sale.
          </p>
          <div className="mt-6">
            <WaitlistForm />
          </div>
        </div>
      </section>

      <Hero />

      {featured.length > 0 && (
        <section className="container-page -mt-4">
          <FeaturedSlider events={featured} />
        </section>
      )}

      <section className="container-page py-16">
        <SectionHeader
          eyebrow="Browse by interest"
          title="What are you in the mood for?"
        />
        <CategoryGrid categories={categories} />
      </section>

      {trending.length > 0 && (
        <section className="container-page py-4">
          <SectionHeader eyebrow="Fresh listings" title="New on Mehfil" href="/events" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trending.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="container-page py-16">
          <SectionHeader eyebrow="Mark your calendar" title="Upcoming" href="/events" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {workshops.length > 0 && (
        <section className="container-page py-4">
          <SectionHeader
            eyebrow="Learn something new"
            title="Workshops"
            href="/events?type=workshop"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {workshops.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      <section className="container-page py-16">
        <SectionHeader eyebrow="Find your city" title="Browse by city" />
        <CityGrid cities={cities} />
      </section>

      {/* Partner with us — the second audience: companies */}
      <section className="container-page pb-20">
        <div className="overflow-hidden rounded-4xl bg-ink px-6 py-14 text-center sm:px-12">
          <span className="mx-auto grid h-12 w-12 place-content-center rounded-2xl bg-white/10 text-white">
            <Store className="h-6 w-6" />
          </span>
          <h2 className="heading-display mx-auto mt-5 max-w-2xl text-display-md text-white">
            Run events, trips or activities? List them with us.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-white/70">
            We&apos;re onboarding businesses ahead of launch. Get your own dashboard to sell
            tickets, manage bookings, and scan guests at the door.
          </p>
          <div className="mt-7">
            <Link
              href="/partner"
              className="inline-flex h-12 items-center rounded-full bg-coral px-7 text-sm font-semibold text-white shadow-coral transition hover:bg-coral-600"
            >
              Partner with Mehfil
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}