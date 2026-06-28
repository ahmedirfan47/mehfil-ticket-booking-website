import Link from "next/link";
import * as Icons from "lucide-react";
import type { Category } from "@/lib/types";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {categories.map((cat) => {
        const Icon = (Icons[cat.icon as keyof typeof Icons] ?? Icons.Sparkles) as Icons.LucideIcon;
        return (
          <Link
            key={cat.id}
            href={`/events?category=${cat.slug}`}
            className="group flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-5 text-center shadow-card transition hover:-translate-y-0.5 hover:border-primary/30"
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary transition group-hover:bg-primary group-hover:text-white">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-ink">{cat.name}</span>
          </Link>
        );
      })}
    </div>
  );
}