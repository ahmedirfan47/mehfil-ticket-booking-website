"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  title: z.string().min(3, "Give your listing a title"),
  summary: z.string().optional(),
  description: z.string().optional(),
  venue: z.string().optional(),
  address: z.string().optional(),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  destination: z.string().optional(),
  duration_text: z.string().optional(),
  meeting_point: z.string().optional(),
  included: z.string().optional(),
  excluded: z.string().optional(),
});
type Values = z.infer<typeof schema>;

// datetime-local needs "YYYY-MM-DDTHH:mm"; trim a stored ISO string to that.
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export function EventEditForm({
  event,
}: {
  event: {
    id: string;
    listing_type: string;
    title: string;
    summary: string | null;
    description: string | null;
    venue: string | null;
    address: string | null;
    starts_at: string | null;
    ends_at: string | null;
    destination: string | null;
    duration_text: string | null;
    meeting_point: string | null;
    included: string | null;
    excluded: string | null;
  };
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const isTrip = event.listing_type === "trip";
  const isActivity = event.listing_type === "activity";
  const isTripOrActivity = isTrip || isActivity;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: event.title ?? "",
      summary: event.summary ?? "",
      description: event.description ?? "",
      venue: event.venue ?? "",
      address: event.address ?? "",
      starts_at: toLocalInput(event.starts_at),
      ends_at: toLocalInput(event.ends_at),
      destination: event.destination ?? "",
      duration_text: event.duration_text ?? "",
      meeting_point: event.meeting_point ?? "",
      included: event.included ?? "",
      excluded: event.excluded ?? "",
    },
  });

  const onSubmit = async (values: Values) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not save changes.");
        return;
      }
      toast.success("Changes saved.");
      router.push("/dashboard/events");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const field = "mt-1.5";
  const textarea =
    "mt-1.5 w-full rounded-xl border border-mist bg-white px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-sky/40";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="rounded-2xl border border-mist bg-white p-5 shadow-card sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Details</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Prices and ticket quantities can&apos;t be changed here once a listing is live — contact
          support if you need to adjust them.
        </p>
        <div className="mt-4 grid gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" className={field} {...register("title")} />
            {errors.title && <p className="mt-1 text-xs text-invalid">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="summary">Short summary</Label>
            <Input id="summary" className={field} {...register("summary")} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea id="description" rows={5} className={textarea} {...register("description")} />
          </div>
        </div>
      </section>

      {isTripOrActivity && (
        <section className="rounded-2xl border border-mist bg-white p-5 shadow-card sm:p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            {isTrip ? "Trip details" : "Activity details"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {isTrip && (
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" className={field} {...register("destination")} />
              </div>
            )}
            <div>
              <Label htmlFor="duration_text">Duration</Label>
              <Input id="duration_text" className={field} {...register("duration_text")} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="meeting_point">Meeting / pickup point</Label>
              <Input id="meeting_point" className={field} {...register("meeting_point")} />
            </div>
            <div>
              <Label htmlFor="included">What&apos;s included</Label>
              <textarea id="included" rows={3} className={textarea} {...register("included")} />
            </div>
            <div>
              <Label htmlFor="excluded">What&apos;s not included</Label>
              <textarea id="excluded" rows={3} className={textarea} {...register("excluded")} />
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-mist bg-white p-5 shadow-card sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">When &amp; where</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="venue">{isTrip ? "Departure city / venue" : "Venue"}</Label>
            <Input id="venue" className={field} {...register("venue")} />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" className={field} {...register("address")} />
          </div>
          <div>
            <Label htmlFor="starts_at">{isTrip ? "Departure date" : "Starts"}</Label>
            <Input id="starts_at" type="datetime-local" className={field} {...register("starts_at")} />
          </div>
          <div>
            <Label htmlFor="ends_at">{isTrip ? "Return date" : "Ends"}</Label>
            <Input id="ends_at" type="datetime-local" className={field} {...register("ends_at")} />
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" variant="primary" disabled={busy}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </form>
  );
}