export const SITE = {
  name: "Mehfil",
  tagline: "Gatherings worth showing up for.",
  description:
    "Discover concerts, workshops, festivals and tech events across Pakistan. Book in seconds, scan at the door.",
} as const;

export const PRICE_FILTERS = [
  { label: "Any price", min: 0, max: Infinity },
  { label: "Free", min: 0, max: 0 },
  { label: "Under Rs 2,000", min: 1, max: 2000 },
  { label: "Rs 2,000 – 5,000", min: 2000, max: 5000 },
  { label: "Rs 5,000+", min: 5000, max: Infinity },
] as const;