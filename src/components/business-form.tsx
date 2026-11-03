"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  company_name: z.string().min(2, "Enter your business name"),
  contact_name: z.string().min(2, "Enter a contact name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  city: z.string().optional(),
  sector: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  facebook: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  instagram: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  description: z.string().optional(),
});
type Values = z.infer<typeof schema>;

export function BusinessForm() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    setBusy(true);
    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not submit. Please try again.");
        return;
      }
      setDone(true);
      toast.success("Application received. We'll be in touch.");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const field = "mt-1.5";

  if (done) {
    return (
      <div className="rounded-3xl border border-valid/30 bg-valid/5 p-8 text-center shadow-card">
        <CheckCircle2 className="mx-auto h-10 w-10 text-valid" />
        <p className="mt-3 font-display text-lg font-semibold text-ink">Application received</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">
          Thanks for your interest in Mehfil. Our team will review your details and reach out by
          email. If you have an account, you&apos;ll get dashboard access once approved.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Your business</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="company_name">Business name</Label>
            <Input id="company_name" className={field} placeholder="Northern Escapes Travel" {...register("company_name")} />
            {errors.company_name && <p className="mt-1 text-xs text-invalid">{errors.company_name.message}</p>}
          </div>
          <div>
            <Label htmlFor="contact_name">Contact name</Label>
            <Input id="contact_name" className={field} placeholder="Your name" {...register("contact_name")} />
            {errors.contact_name && <p className="mt-1 text-xs text-invalid">{errors.contact_name.message}</p>}
          </div>
          <div>
            <Label htmlFor="sector">What do you offer?</Label>
            <select
              id="sector"
              className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              {...register("sector")}
            >
              <option value="">Select</option>
              <option value="events">Events</option>
              <option value="trips">Trips &amp; travel</option>
              <option value="activities">Activities &amp; experiences</option>
              <option value="multiple">Multiple</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <Label htmlFor="email">Business email</Label>
            <Input id="email" type="email" className={field} placeholder="you@business.com" {...register("email")} />
            {errors.email && <p className="mt-1 text-xs text-invalid">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" className={field} placeholder="+92 3XX XXXXXXX" {...register("phone")} />
            {errors.phone && <p className="mt-1 text-xs text-invalid">{errors.phone.message}</p>}
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" className={field} placeholder="Lahore" {...register("city")} />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" className={field} placeholder="https://..." {...register("website")} />
            {errors.website && <p className="mt-1 text-xs text-invalid">{errors.website.message}</p>}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Social presence</h2>
        <p className="mt-1 text-xs text-ink-muted">Helps us verify you faster. Optional but recommended.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" className={field} placeholder="https://facebook.com/..." {...register("facebook")} />
          </div>
          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" className={field} placeholder="https://instagram.com/..." {...register("instagram")} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" className={field} placeholder="https://linkedin.com/company/..." {...register("linkedin")} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-5 shadow-card sm:p-6">
        <Label htmlFor="description">Tell us about your business</Label>
        <textarea
          id="description"
          rows={5}
          className="mt-1.5 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          placeholder="What you do, the kind of events/trips/activities you run, roughly how many per month, and anything that helps us review you."
          {...register("description")}
        />
      </section>

      <Button type="submit" size="lg" disabled={busy}>
        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit application
      </Button>
    </form>
  );
}