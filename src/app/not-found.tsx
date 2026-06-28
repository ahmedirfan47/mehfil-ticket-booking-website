import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <main className="container-page grid min-h-[70vh] place-content-center text-center">
      <span className="mx-auto grid h-16 w-16 place-content-center rounded-2xl bg-primary-50 text-primary">
        <Compass className="h-7 w-7" />
      </span>
      <h1 className="heading-display mt-5 text-4xl">Lost the plot?</h1>
      <p className="mx-auto mt-2 max-w-sm text-ink-muted">
        We couldn’t find that page. The event may have ended or moved.
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-medium text-white"
        >
          Back to Mehfil
        </Link>
      </div>
    </main>
  );
}