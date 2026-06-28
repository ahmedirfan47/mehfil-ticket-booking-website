import Link from "next/link";
import Image from "next/image";
import type { City } from "@/lib/types";

export function CityGrid({ cities }: { cities: City[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {cities.map((city) => (
        <Link
          key={city.id}
          href={`/city/${city.slug}`}
          className="group relative aspect-[4/5] overflow-hidden rounded-2xl shadow-card"
        >
          {city.image_url ? (
            <Image
              src={city.image_url}
              alt={city.name}
              fill
              sizes="(max-width: 768px) 50vw, 220px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="h-full w-full bg-primary-100" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <p className="font-display text-lg font-semibold text-white">{city.name}</p>
            {city.province && <p className="text-xs text-white/70">{city.province}</p>}
          </div>
        </Link>
      ))}
    </div>
  );
}