import { CalendarX } from "lucide-react";

export function EmptyState({
  title = "Nothing here yet",
  description = "Check back soon — new events are added every week.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-white py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-50 text-primary">
        <CalendarX className="h-6 w-6" />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>
    </div>
  );
}