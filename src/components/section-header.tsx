import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeader({
  eyebrow,
  title,
  href,
  cta,
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="heading-display text-2xl sm:text-3xl">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="hidden items-center gap-1 text-sm font-semibold text-primary hover:gap-2 sm:inline-flex"
        >
          {cta ?? "View all"} <ArrowRight className="h-4 w-4 transition-all" />
        </Link>
      )}
    </div>
  );
}