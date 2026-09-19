"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function UpgradeButton({ plan, label }: { plan: string; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const upgrade = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/subscription/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not change your plan.");
        return;
      }
      toast.success("Plan updated.");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={upgrade}
      disabled={busy}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-white disabled:opacity-60"
    >
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </button>
  );
}