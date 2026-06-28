"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { City, Category } from "@/lib/types";

const schema = z.object({
  title: z.string().min(3, "Give your event a title"),
  summary: z.string().optional(),
  description: z.string().optional(),
  cover_url: z.string().url("Enter a valid image URL").optional().or(z.literal("")),
  city_id: z.string().optional(),
  category_id: z.string().optional(),
  venue: z.string().optional(),
  address: z.string().optional(),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  is_workshop: z.boolean().default(false),
  ticket_types: z
    .array(
      z.object({
        name: z.string().min(1, "Name"),
        price_pkr: z.coerce.number().int().min(0),
        quantity_total: z.coerce.number().int().min(1, "Min 1"),
      })
    )
    .min(1),
});
type Values = z.infer<typeof schema>;

export function EventForm({ cities, categories }: { cities: City[]; categories: Category[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      is_workshop: false,
      ticket_types: [{ name: "General", price_pkr: 0, quantity_total: 100 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "ticket_types" });

  const submit = (publish: boolean) =>
    handleSubmit(async (values) => {
      setBusy(true);
      try {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, publish }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "Could not create event.");
          return;
        }
        toast.success(publish ? "Event published!" : "Draft saved.");
        router.push("/dashboard/events");
        router.refresh();
      } catch {
        toast.error("Something went wrong.");
      } finally {
        setBusy(false);
      }
    })();

  const field = "mt-1.5";

  return (
    <form className="space-y-8">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Details</h2>
        <div className="mt-4 grid gap-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" className={field} placeholder="Indie Night Live" {...register("title")} />
            {errors.title && <p className="mt-1 text-xs text-invalid">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor="summary">Short summary</Label>
            <Input
              id="summary"
              className={field}
              placeholder="One line that sells the night"
              {...register("summary")}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={5}
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              placeholder="Tell guests what to expect..."
              {...register("description")}
            />
          </div>
          <div>
            <Label htmlFor="cover_url">Cover image URL</Label>
            <Input
              id="cover_url"
              className={field}
              placeholder="https://..."
              {...register("cover_url")}
            />
            {errors.cover_url && (
              <p className="mt-1 text-xs text-invalid">{errors.cover_url.message}</p>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" className="h-4 w-4 rounded border-line" {...register("is_workshop")} />
            This is a workshop
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">When &amp; where</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="city_id">City</Label>
            <select
              id="city_id"
              className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              {...register("city_id")}
            >
              <option value="">Select city</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="category_id">Category</Label>
            <select
              id="category_id"
              className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              {...register("category_id")}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="venue">Venue</Label>
            <Input id="venue" className={field} placeholder="Alhamra Arts Council" {...register("venue")} />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" className={field} placeholder="The Mall, Lahore" {...register("address")} />
          </div>
          <div>
            <Label htmlFor="starts_at">Starts</Label>
            <Input id="starts_at" type="datetime-local" className={field} {...register("starts_at")} />
          </div>
          <div>
            <Label htmlFor="ends_at">Ends</Label>
            <Input id="ends_at" type="datetime-local" className={field} {...register("ends_at")} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">Tickets</h2>
          <Button
            type="button"
            size="sm"
            variant="subtle"
            onClick={() => append({ name: "", price_pkr: 0, quantity_total: 50 })}
          >
            <Plus className="mr-1.5 h-4 w-4" /> Add type
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {fields.map((f, i) => (
            <div key={f.id} className="grid grid-cols-[1fr_auto_auto_auto] items-end gap-2">
              <div>
                {i === 0 && <Label>Name</Label>}
                <Input className="mt-1.5" placeholder="General" {...register(`ticket_types.${i}.name`)} />
              </div>
              <div className="w-28">
                {i === 0 && <Label>Price (Rs)</Label>}
                <Input
                  className="mt-1.5"
                  type="number"
                  min={0}
                  {...register(`ticket_types.${i}.price_pkr`)}
                />
              </div>
              <div className="w-24">
                {i === 0 && <Label>Qty</Label>}
                <Input
                  className="mt-1.5"
                  type="number"
                  min={1}
                  {...register(`ticket_types.${i}.quantity_total`)}
                />
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => fields.length > 1 && remove(i)}
                aria-label="Remove ticket type"
              >
                <Trash2 className="h-4 w-4 text-ink-muted" />
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-muted">Set price to 0 for a free event.</p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="primary" disabled={busy} onClick={() => submit(true)}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Publish event
        </Button>
        <Button type="button" variant="outline" disabled={busy} onClick={() => submit(false)}>
          Save as draft
        </Button>
      </div>
    </form>
  );
}