"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }
    setBusy(true);
    // Wire to your email provider (Resend/Supabase) here.
    setTimeout(() => {
      setBusy(false);
      setEmail("");
      toast.success("You're on the list. See you at the next mehfil.");
    }, 600);
  };

  return (
    <section className="container-page">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center sm:px-12">
        <div className="absolute inset-0 bg-mesh-hero opacity-40" />
        <div className="relative mx-auto max-w-xl">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-white">
            <Mail className="h-6 w-6" />
          </span>
          <h2 className="mt-5 font-display text-2xl font-semibold text-white sm:text-3xl">
            Never miss what's on
          </h2>
          <p className="mt-2 text-white/80">
            Weekly picks of the best events in your city. No spam, unsubscribe anytime.
          </p>
          <form onSubmit={submit} className="mx-auto mt-6 flex max-w-md gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="h-11 flex-1 rounded-full bg-white/95 px-5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Email address"
            />
            <Button type="submit" variant="accent" disabled={busy}>
              {busy ? "Joining…" : "Subscribe"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}