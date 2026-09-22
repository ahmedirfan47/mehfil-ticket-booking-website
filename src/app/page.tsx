import { Hero } from "@/components/hero";
import { FeaturedSlider } from "@/components/featured-slider";
import { EventCard } from "@/components/event-card";
import { CategoryGrid } from "@/components/category-grid";
import { CityGrid } from "@/components/city-grid";
import { SectionHeader } from "@/components/section-header";
import { Newsletter } from "@/components/newsletter";
import { Testimonials } from "@/components/testimonials";
import { Sponsors } from "@/components/sponsors";
import { EmptyState } from "@/components/empty-state";
import { WaitlistForm } from "@/components/waitlist-form";
import { Sparkles } from "lucide-react";
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
      <section className="border-b border-line bg-mesh-hero">
        <div className="container-page py-10 text-center">
          <span className="eyebrow justify-center">
            <Sparkles className="h-4 w-4" /> Launching soon
          </span>
          <h2 className="heading-display mx-auto mt-3 max-w-2xl text-2xl sm:text-3xl">
            Be first through the door when Mehfil goes live
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
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

      <section className="container-page py-4">
        <SectionHeader
          eyebrow="Hot right now"
          title="Trending events"
          href="/events"
        />
        {trending.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {trending.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      <Sponsors />

      <section className="container-page py-16">
        <SectionHeader eyebrow="Mark your calendar" title="Upcoming events" href="/events" />
        {upcoming.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      {workshops.length > 0 && (
        <section className="container-page py-4">
          <SectionHeader
            eyebrow="Learn something new"
            title="Popular workshops"
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

      <Newsletter />

      <section className="container-page py-16">
        <SectionHeader eyebrow="Loved by thousands" title="What people say" />
        <Testimonials />
      </section>
    </>
  );
}