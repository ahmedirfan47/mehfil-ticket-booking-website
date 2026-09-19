"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Minus, Plus, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { TicketView, type PrintedTicketData } from "@/components/ticket-view";
import { formatPKR } from "@/lib/utils";
import type { EventWithRelations } from "@/lib/types";

const formSchema = z.object({
  buyerName: z.string().min(2, "Enter your full name"),
  buyerEmail: z.string().email("Enter a valid email"),
  buyerPhone: z.string().min(7, "Enter a valid phone number"),
});
type FormValues = z.infer<typeof formSchema>;

type Traveller = { name: string; phone: string; ref: string };

export function CheckoutForm({ event }: { event: EventWithRelations }) {
  const activeTypes = event.ticket_types.filter((t) => t.is_active);
  const [typeId, setTypeId] = useState(activeTypes[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [tickets, setTickets] = useState<PrintedTicketData[] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const listingType = event.listing_type ?? "event";
  const needsTravellers = listingType === "trip" || listingType === "activity";
  const personWord = listingType === "trip" ? "Traveller" : "Attendee";

  const [travellers, setTravellers] = useState<Traveller[]>([{ name: "", phone: "", ref: "" }]);

  // Keep the traveller list length in sync with quantity.
  useEffect(() => {
    setTravellers((prev) => {
      const next = [...prev];
      while (next.length < qty) next.push({ name: "", phone: "", ref: "" });
      return next.slice(0, qty);
    });
  }, [qty]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const selected = activeTypes.find((t) => t.id === typeId);
  const maxQty = selected ? Math.min(10, selected.quantity_total - selected.quantity_sold) : 0;
  const total = selected ? selected.price_pkr * qty : 0;

  const setTraveller = (i: number, field: keyof Traveller, val: string) => {
    setTravellers((prev) => prev.map((t, idx) => (idx === i ? { ...t, [field]: val } : t)));
  };

  const onSubmit = async (values: FormValues) => {
    if (!selected) return;

    // Validate traveller details for trips/activities.
    if (needsTravellers) {
      for (let i = 0; i < qty; i++) {
        const t = travellers[i];
        if (!t || t.name.trim().length < 2) {
          toast.error(`Enter a name for ${personWord.toLowerCase()} ${i + 1}.`);
          return;
        }
        if (!t.phone || t.phone.trim().length < 7) {
          toast.error(`Enter a phone number for ${personWord.toLowerCase()} ${i + 1}.`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketTypeId: selected.id,
          quantity: qty,
          buyerName: values.buyerName,
          buyerEmail: values.buyerEmail,
          buyerPhone: values.buyerPhone,
          travellers: needsTravellers ? travellers.slice(0, qty) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not complete your purchase.");
        return;
      }
      const printed: PrintedTicketData[] = data.tickets.map((t: any) => ({
        code: t.code,
        qr_token: t.qr_token,
        holder_name: t.holder_name ?? values.buyerName,
        event_title: event.title,
        venue: event.venue,
        starts_at: event.starts_at,
        order_number: data.order_id,
        ticket_type: selected.name,
      }));
      setTickets(printed);
      toast.success("Payment confirmed. Your tickets are ready.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (tickets) {
    return (
      <div className="space-y-8">
        <div className="rounded-3xl border border-valid/20 bg-valid/5 p-6 text-center">
          <p className="font-display text-2xl font-semibold text-ink">You&apos;re going! 🎉</p>
          <p className="mt-1 text-sm text-ink-muted">
            {tickets.length} ticket{tickets.length > 1 ? "s" : ""} for {event.title}. Show the QR at
            the door — staff scan it in one tap.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {tickets.map((t) => (
            <TicketView key={t.code} ticket={t} />
          ))}
        </div>
        <div className="text-center">
          <Button variant="outline" onClick={() => window.print()}>
            Download / print tickets
          </Button>
        </div>
      </div>
    );
  }

  if (!activeTypes.length) {
    return (
      <Card className="p-8 text-center">
        <p className="text-ink-muted">Tickets for this listing are not on sale right now.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Ticket type */}
        <Card className="p-6">
          <h2 className="heading-display text-lg">
            {listingType === "trip" ? "Choose your seat" : listingType === "activity" ? "Choose your spot" : "Choose your ticket"}
          </h2>
          <div className="mt-4 space-y-3">
            {activeTypes.map((t) => {
              const tLeft = t.quantity_total - t.quantity_sold;
              const disabled = tLeft <= 0;
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    setTypeId(t.id);
                    setQty(1);
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition disabled:opacity-50 ${
                    typeId === t.id
                      ? "border-primary bg-primary-50"
                      : "border-line hover:border-primary/40"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-ink">{t.name}</p>
                    <p className="text-xs text-ink-muted">
                      {disabled ? "Sold out" : `${tLeft} available`}
                    </p>
                  </div>
                  <p className="font-display text-lg font-semibold text-ink">
                    {formatPKR(t.price_pkr)}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <Label>Quantity</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-9 w-9 place-items-center rounded-full border border-line hover:border-primary"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-semibold">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                className="grid h-9 w-9 place-items-center rounded-full border border-line hover:border-primary"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Traveller / attendee details (trips & activities) */}
        {needsTravellers && (
          <Card className="p-6">
            <h2 className="flex items-center gap-2 heading-display text-lg">
              <Users className="h-5 w-5 text-primary" /> {personWord} details
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              We share these with the organizer so they can prepare for each person.
            </p>
            <div className="mt-4 space-y-5">
              {Array.from({ length: qty }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-line p-4">
                  <p className="mb-3 text-sm font-semibold text-ink">
                    {personWord} {i + 1}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Full name</Label>
                      <Input
                        className="mt-1.5"
                        placeholder="Full name"
                        value={travellers[i]?.name ?? ""}
                        onChange={(e) => setTraveller(i, "name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        className="mt-1.5"
                        placeholder="+92 3XX XXXXXXX"
                        value={travellers[i]?.phone ?? ""}
                        onChange={(e) => setTraveller(i, "phone", e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label>ID / passport reference (optional)</Label>
                      <Input
                        className="mt-1.5"
                        placeholder="Optional"
                        value={travellers[i]?.ref ?? ""}
                        onChange={(e) => setTraveller(i, "ref", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Buyer details */}
        <Card className="p-6">
          <h2 className="heading-display text-lg">Your details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="buyerName">Full name</Label>
              <Input id="buyerName" {...register("buyerName")} placeholder="Ayesha Khan" />
              {errors.buyerName && (
                <p className="mt-1 text-xs text-invalid">{errors.buyerName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="buyerEmail">Email</Label>
              <Input id="buyerEmail" type="email" {...register("buyerEmail")} placeholder="you@email.com" />
              {errors.buyerEmail && (
                <p className="mt-1 text-xs text-invalid">{errors.buyerEmail.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="buyerPhone">Phone</Label>
              <Input id="buyerPhone" {...register("buyerPhone")} placeholder="+92 3XX XXXXXXX" />
              {errors.buyerPhone && (
                <p className="mt-1 text-xs text-invalid">{errors.buyerPhone.message}</p>
              )}
            </div>
          </div>
        </Card>
      </form>

      {/* Order summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Card className="ticket-stub p-6">
          <h2 className="heading-display text-lg">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-ink-muted">
              <span>
                {selected?.name} × {qty}
              </span>
              <span>{formatPKR(total)}</span>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>Service fee</span>
              <span>Rs 0</span>
            </div>
            <div className="flex justify-between border-t border-line pt-3 font-display text-lg font-semibold text-ink">
              <span>Total</span>
              <span>{formatPKR(total)}</span>
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            className="mt-5 w-full"
            disabled={submitting || !selected}
            onClick={handleSubmit(onSubmit)}
          >
            {submitting ? "Processing…" : total === 0 ? "Get free ticket" : `Pay ${formatPKR(total)}`}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-muted">
            <ShieldCheck className="h-4 w-4 text-valid" /> Tickets issued instantly
          </p>
        </Card>
      </aside>
    </div>
  );
}