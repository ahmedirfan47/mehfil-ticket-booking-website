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