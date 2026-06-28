"use client";

import { useEffect, useState } from "react";
import { Ticket as TicketIcon } from "lucide-react";
import { generateQRDataUrl } from "@/lib/tickets";
import { formatEventDate } from "@/lib/utils";

export interface PrintedTicketData {
  code: string;
  qr_token: string;
  holder_name: string;
  event_title: string;
  venue?: string | null;
  starts_at?: string | null;
  seat_label?: string | null;
  order_number?: string | null;
  ticket_type?: string | null;
}

export function TicketView({ ticket }: { ticket: PrintedTicketData }) {
  const [qr, setQr] = useState<string>("");

  useEffect(() => {
    generateQRDataUrl(ticket.qr_token).then(setQr).catch(() => setQr(""));
  }, [ticket.qr_token]);

  return (
    <div className="mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
      {/* Top: event info */}
      <div className="bg-primary px-6 py-5 text-white">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/80">
          <TicketIcon className="h-4 w-4" /> Mehfil ticket
        </div>
        <h3 className="mt-2 font-display text-xl font-semibold leading-tight">
          {ticket.event_title}
        </h3>
        <p className="mt-1 text-sm text-white/80">{formatEventDate(ticket.starts_at ?? null)}</p>
        {ticket.venue && <p className="text-sm text-white/80">{ticket.venue}</p>}
      </div>

      {/* Perforation */}
      <div className="perf-divide mx-6" />

      {/* QR */}
      <div className="flex flex-col items-center px-6 py-6">
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qr} alt={`QR for ${ticket.code}`} className="h-44 w-44" />
        ) : (
          <div className="h-44 w-44 animate-pulse rounded-xl bg-line" />
        )}
        <p className="mt-3 font-display text-lg font-semibold tracking-wider text-ink">
          {ticket.code}
        </p>
        {/* Simple CSS barcode for visual parity; the QR is the scan target. */}
        <div className="mt-2 flex h-8 items-end gap-[2px]" aria-hidden>
          {ticket.code.split("").map((ch, i) => (
            <span
              key={i}
              className="bg-ink"
              style={{ width: 2, height: `${12 + (ch.charCodeAt(0) % 20)}px` }}
            />
          ))}
        </div>
      </div>

      {/* Holder details */}
      <div className="grid grid-cols-2 gap-y-3 border-t border-line px-6 py-5 text-sm">
        <Field label="Name" value={ticket.holder_name} />
        <Field label="Type" value={ticket.ticket_type ?? "General"} />
        {ticket.seat_label && <Field label="Seat" value={ticket.seat_label} />}
        {ticket.order_number && <Field label="Order" value={ticket.order_number} />}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="font-medium text-ink">{value}</p>
    </div>
  );
}