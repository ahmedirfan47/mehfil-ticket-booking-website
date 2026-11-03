import Link from "next/link";
import { Ticket } from "lucide-react";
import { SITE, CONTACT } from "@/lib/constants";

const columns = [
  {
    title: "Discover",
    links: [
      { href: "/events", label: "All events" },
      { href: "/events?type=trip", label: "Trips" },
      { href: "/events?type=activity", label: "Activities" },
    ],
  },
  {
    title: "For business",
    links: [
      { href: "/partner", label: "Partner with us" },
      { href: "/dashboard", label: "Organizer dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-mist bg-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky text-white">
              <Ticket className="h-5 w-5" />
            </span>
            <span className="font-display text-xl font-semibold">Mehfil</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-ink-muted">{SITE.description}</p>
          <a
            href={`mailto:${CONTACT.email}`}
            className="mt-4 inline-block text-sm text-sky hover:underline"
          >
            {CONTACT.email}
          </a>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-ink">{col.title}</h4>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-ink-muted hover:text-sky">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-mist">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-ink-muted md:flex-row">
          <p>© {new Date().getFullYear()} Mehfil. {CONTACT.entityLine}</p>
          <p>{CONTACT.city}</p>
        </div>
      </div>
    </footer>
  );
}