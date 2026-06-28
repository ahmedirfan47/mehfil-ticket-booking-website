"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";
import type { City, Category } from "@/lib/types";

export function FilterBar({
  cities,
  categories,
}: {
  cities: City[];
  categories: Category[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/events?${next.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        className="w-auto"
        value={params.get("city") ?? ""}
        onChange={(e) => update("city", e.target.value)}
        aria-label="Filter by city"
      >
        <option value="">All cities</option>
        {cities.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </Select>

      <Select
        className="w-auto"
        value={params.get("category") ?? ""}
        onChange={(e) => update("category", e.target.value)}
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </Select>

      <Select
        className="w-auto"
        value={params.get("price") ?? ""}
        onChange={(e) => update("price", e.target.value)}
        aria-label="Filter by price"
      >
        <option value="">Any price</option>
        <option value="free">Free</option>
        <option value="paid">Paid</option>
      </Select>

      <Select
        className="w-auto"
        value={params.get("sort") ?? "soon"}
        onChange={(e) => update("sort", e.target.value)}
        aria-label="Sort"
      >
        <option value="soon">Soonest</option>
        <option value="new">Newest</option>
      </Select>
    </div>
  );
}