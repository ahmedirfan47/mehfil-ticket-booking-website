export const SITE = {
  name: "Mehfil",
  tagline: "Something to look forward to.",
  description:
    "Discover and book events, trips and activities across Pakistan. Book in seconds, scan at the door.",
} as const;

// All contact / operator details in one place — change here, updates everywhere.
export const CONTACT = {
  email: "mehfil@stonic.site",
  operator: "Stonic",
  city: "Lahore, Pakistan",
  // Human sentence used on legal pages. No claim of incorporation.
  entityLine: "Mehfil is a service operated by Stonic.",
} as const;

export const PRICE_FILTERS = [
  { label: "Any price", min: 0, max: Infinity },
  { label: "Free", min: 0, max: 0 },
  { label: "Under Rs 2,000", min: 1, max: 2000 },
  { label: "Rs 2,000 – 5,000", min: 2000, max: 5000 },
  { label: "Rs 5,000+", min: 5000, max: Infinity },
] as const;