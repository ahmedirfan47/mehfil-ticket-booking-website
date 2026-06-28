import Link from "next/link";
import { Ticket } from "lucide-react";
import { SITE } from "@/lib/constants";

const columns = [
  {
    title: "Discover",
    links: [
      { href: "/events", label: "All events" },
      { href: "/events?type=workshop", label: "Workshops" },
      { href: "/city/lahore", label: "Browse cities" },
    ],
  },
  {
    title: "Organize",
    links: [
      { href: "/dashboard", label: "Organizer dashboard" },
      { href: "/dashboard/events/new", label: "Create an event" },
      { href: "/staff", label: "Staff scanner" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/", label: "About" },
      { href: "/", label: "Contact" },
      { href: "/", label: "Help centre" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">
              <Ticket className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-semibold">Mehfil</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-ink-muted">{SITE.description}</p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-ink">{col.title}</h4>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-ink-muted hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-ink-muted md:flex-row">
          <p>© {new Date().getFullYear()} Mehfil. Made in Pakistan.</p>
          <p>Pay with JazzCash · Easypaisa · Card</p>
        </div>
      </div>
    </footer>
  );
}