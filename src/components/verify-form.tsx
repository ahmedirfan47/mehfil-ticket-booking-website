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
  legal_name: z.string().min(2, "Enter your legal / business name"),
  business_email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  facebook: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  instagram: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});
type Values = z.infer<typeof schema>;

export function VerifyForm({ defaults }: { defaults: Partial<Values> }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: defaults });

  const onSubmit = async (values: Values) => {
    setBusy(true);
    try {
      const res = await fetch("/api/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not submit.");
        return;
      }
      toast.success("Submitted for review. We'll notify you once approved.");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const field = "mt-1.5";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Business details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="legal_name">Legal / business name</Label>
            <Input id="legal_name" className={field} placeholder="Ahmed Events Pvt Ltd" {...register("legal_name")} />
            {errors.legal_name && <p className="mt-1 text-xs text-invalid">{errors.legal_name.message}</p>}
          </div>
          <div>
            <Label htmlFor="business_email">Business email</Label>
            <Input id="business_email" type="email" className={field} placeholder="you@business.com" {...register("business_email")} />
            {errors.business_email && <p className="mt-1 text-xs text-invalid">{errors.business_email.message}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" className={field} placeholder="+92 3XX XXXXXXX" {...register("phone")} />
            {errors.phone && <p className="mt-1 text-xs text-invalid">{errors.phone.message}</p>}
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" className={field} placeholder="https://..." {...register("website")} />
            {errors.website && <p className="mt-1 text-xs text-invalid">{errors.website.message}</p>}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Social proof</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Add at least one active profile so we can confirm you are a real organizer.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" className={field} placeholder="https://facebook.com/..." {...register("facebook")} />
            {errors.facebook && <p className="mt-1 text-xs text-invalid">{errors.facebook.message}</p>}
          </div>
          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" className={field} placeholder="https://instagram.com/..." {...register("instagram")} />
            {errors.instagram && <p className="mt-1 text-xs text-invalid">{errors.instagram.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" className={field} placeholder="https://linkedin.com/company/..." {...register("linkedin")} />
            {errors.linkedin && <p className="mt-1 text-xs text-invalid">{errors.linkedin.message}</p>}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
        <Label htmlFor="notes">Anything else for our team?</Label>
        <textarea
          id="notes"
          rows={4}
          className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          placeholder="Past events, references, or details that help us verify you."
          {...register("notes")}
        />
      </section>

      <Button type="submit" disabled={busy}>
        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit for verification
      </Button>
    </form>
  );
}