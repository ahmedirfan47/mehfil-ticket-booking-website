import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { EventCard } from "@/components/event-card";
import { EmptyState } from "@/components/empty-state";
import { getCityBySlug, getEvents } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const city = await getCityBySlug(params.slug);
  return { title: city ? `Events in ${city.name}` : "City" };
}

export default async function CityPage({ params }: { params: { slug: string } }) {
  const city = await getCityBySlug(params.slug);
  if (!city) notFound();

  const events = await getEvents({ citySlug: params.slug });

  return (
    <div>
      <div className="relative h-56 w-full overflow-hidden">
        {city.image_url && (
          <Image src={city.image_url} alt={city.name} fill priority className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-ink/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="container-page pb-6">
            <p className="text-sm text-white/70">{city.province}</p>
            <h1 className="font-display text-4xl font-semibold text-white">{city.name}</h1>
          </div>
        </div>
      </div>

      <div className="container-page py-12">
        <p className="mb-6 text-sm text-ink-muted">
          {events.length} {events.length === 1 ? "event" : "events"} in {city.name}
        </p>
        {events.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={`No events in ${city.name} yet`}
            description="Be the first to know — subscribe on the homepage."
          />
        )}
      </div>
    </div>
  );
}