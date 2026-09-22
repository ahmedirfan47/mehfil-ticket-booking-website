"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not join the waitlist.");
        return;
      }
      setDone(true);
      toast.success("You're on the list. We'll email you at launch.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-full border border-valid/30 bg-valid/10 px-5 py-3 text-sm font-medium text-valid">
        <CheckCircle2 className="h-4 w-4" /> You&apos;re on the waitlist
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto flex max-w-md gap-2">
      <div className="relative flex-1">
        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="h-12 w-full rounded-full border border-line bg-white pl-11 pr-4 text-sm text-ink placeholder:text-ink-muted focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label="Email address"
        />
      </div>
      <Button type="submit" size="lg" disabled={busy} className="shrink-0">
        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Join waitlist
      </Button>
    </form>
  );
}