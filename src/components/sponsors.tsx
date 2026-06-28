const sponsors = ["JazzCash", "Easypaisa", "Foodpanda", "Daraz", "Careem", "Bykea", "Zameen", "Telenor"];

export function Sponsors() {
  return (
    <section className="border-y border-line bg-white py-10">
      <div className="container-page">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
          Trusted by partners across Pakistan
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {sponsors.map((s) => (
            <span key={s} className="font-display text-lg font-semibold text-ink/40">
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}