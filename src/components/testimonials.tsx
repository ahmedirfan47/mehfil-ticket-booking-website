const items = [
  {
    quote: "Booked four tickets in under a minute and walked straight in. The QR scan was instant.",
    name: "Ayesha K.",
    role: "Attendee, Lahore",
  },
  {
    quote: "We sold out our Karachi summit and the door team scanned 600 guests without a hitch.",
    name: "Bilal R.",
    role: "Organizer",
  },
  {
    quote: "Finally a Pakistani platform that feels world-class. The dashboards are genuinely useful.",
    name: "Hina S.",
    role: "Event manager",
  },
];

export function Testimonials() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {items.map((t) => (
        <figure
          key={t.name}
          className="rounded-3xl border border-line bg-surface p-6 shadow-card"
        >
          <div className="text-3xl leading-none text-primary">"</div>
          <blockquote className="mt-2 text-ink-soft">{t.quote}</blockquote>
          <figcaption className="mt-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-50 font-semibold text-primary">
              {t.name[0]}
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{t.name}</p>
              <p className="text-xs text-ink-muted">{t.role}</p>
            </div>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}