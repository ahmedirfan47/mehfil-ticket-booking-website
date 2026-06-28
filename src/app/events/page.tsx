import { EventCard } from "@/components/event-card";
import { FilterBar } from "@/components/filter-bar";
import { SearchBar } from "@/components/search-bar";
import { EmptyState } from "@/components/empty-state";
import { getEvents, getCities, getCategories } from "@/lib/queries";

export const revalidate = 60;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { [k: string]: string | undefined };
}) {
  const isWorkshop = searchParams.type === "workshop";
  const [events, cities, categories] = await Promise.all([
    getEvents({
      q: searchParams.q,
      citySlug: searchParams.city,
      categorySlug: searchParams.category,
      workshopsOnly: isWorkshop,
      orderBy: searchParams.sort === "new" ? "created_at" : "starts_at",
    }),
    getCities(),
    getCategories(),
  ]);

  // Free/Paid filter applied here (depends on ticket-type prices).
  const filtered = events.filter((e) => {
    if (searchParams.price === "free") return e.is_free;
    if (searchParams.price === "paid") return !e.is_free;
    return true;
  });

  return (
    <div className="container-page py-12">
      <div className="mb-2 flex flex-col gap-1">
        <p className="eyebrow">{isWorkshop ? "Workshops" : "Discover"}</p>
        <h1 className="heading-display text-3xl sm:text-4xl">
          {searchParams.q
            ? `Results for "${searchParams.q}"`
            : isWorkshop
            ? "Workshops across Pakistan"
            : "All events"}
        </h1>
      </div>

      <div className="mt-6 mb-8 space-y-4">
        <SearchBar />
        <FilterBar cities={cities} categories={categories} />
      </div>

      <p className="mb-6 text-sm text-ink-muted">
        {filtered.length} {filtered.length === 1 ? "event" : "events"} found
      </p>

      {filtered.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No events match your filters"
          description="Try clearing a filter or searching a different city."
        />
      )}
    </div>
  );
}