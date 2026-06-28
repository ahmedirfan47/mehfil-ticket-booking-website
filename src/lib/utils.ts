import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner (shadcn convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format whole rupees as "Rs 3,500" / "Free". */
export function formatPKR(amount: number): string {
  if (!amount) return "Free";
  return "Rs " + amount.toLocaleString("en-PK");
}

/** "Sat, 12 Jul · 7:00 PM" */
export function formatEventDate(iso: string | null): string {
  if (!iso) return "Date TBA";
  const d = new Date(iso);
  return d.toLocaleString("en-PK", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateShort(iso: string | null): string {
  if (!iso) return "TBA";
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Lowest active price across a list of ticket types. */
export function lowestPrice(types: { price_pkr: number; is_active: boolean }[]): number {
  const active = types.filter((t) => t.is_active);
  if (!active.length) return 0;
  return Math.min(...active.map((t) => t.price_pkr));
}

/** Remaining tickets across all types. */
export function remaining(types: { quantity_total: number; quantity_sold: number }[]): number {
  return types.reduce((sum, t) => sum + (t.quantity_total - t.quantity_sold), 0);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}