import { EventCard } from "@/components/event-card";
import { FilterBar } from "@/components/filter-bar";
import { SearchBar } from "@/components/search-bar";
import { EmptyState } from "@/components/empty-state";
import { getEvents, getCities, getCategories } from "@/lib/queries";
import type { ListingType } from "@/lib/types";

export const revalidate = 60;

type TypeMeta = {
  eyebrow: string;
  heading: string;
  noun: string;
  listingType?: ListingType;
  workshopsOnly?: boolean;
};

const TYPE_META: { [key: string]: TypeMeta } = {
  workshop: {
    eyebrow: "Workshops",
    heading: "Workshops across Pakistan",
    noun: "workshop",
    workshopsOnly: true,
  },
  trip: {
    eyebrow: "Trips",
    heading: "Trips & travel across Pakistan",
    noun: "trip",
    listingType: "trip",
  },
  activity: {
    eyebrow: "Activities",
    heading: "Activities & experiences",
    noun: "activity",
    listingType: "activity",
  },
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { [k: string]: string | undefined };
}) {
  const typeKey = searchParams.type ?? "";
  const meta = TYPE_META[typeKey];

  const [events, cities, categories] = await Promise.all([
    getEvents({
      q: searchParams.q,
      citySlug: searchParams.city,
      categorySlug: searchParams.category,
      workshopsOnly: meta?.workshopsOnly,
      listingType: meta?.listingType,
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

  const noun = meta?.noun ?? "result";

  return (
    <div className="container-page py-12">
      <div className="mb-2 flex flex-col gap-1">
        <p className="eyebrow">{meta?.eyebrow ?? "Discover"}</p>
        <h1 className="heading-display text-3xl sm:text-4xl">
          {searchParams.q
            ? `Results for "${searchParams.q}"`
            : meta?.heading ?? "All events"}
        </h1>
      </div>

      <div className="mt-6 mb-8 space-y-4">
        <SearchBar />
        <FilterBar cities={cities} categories={categories} />
      </div>

      <p className="mb-6 text-sm text-ink-muted">
        {filtered.length} {filtered.length === 1 ? noun : `${noun}s`} found
      </p>

      {filtered.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={`No ${noun}s match your filters`}
          description="Try clearing a filter or searching a different city."
        />
      )}
    </div>
  );
}