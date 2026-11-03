"use client";

import { Download } from "lucide-react";

export function WaitlistExport() {
  return (
    <a
      href="/api/waitlist/export"
      download
      className="inline-flex h-9 items-center gap-2 rounded-xl border border-mist bg-white px-4 text-xs font-medium text-ink transition hover:border-sky/40 hover:text-sky"
    >
      <Download className="h-4 w-4" /> Export CSV
    </a>
  );
}