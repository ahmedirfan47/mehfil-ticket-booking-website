"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Ban } from "lucide-react";

export function CancelListingButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const cancel = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/events/${id}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not cancel.");
        return;
      }
      toast.success("Listing cancelled.");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <button
          onClick={cancel}
          disabled={busy}
          className="inline-flex h-7 items-center gap-1 rounded-lg bg-invalid/10 px-2.5 text-xs font-medium text-invalid disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          Confirm
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={busy}
          className="text-xs text-ink-muted hover:text-ink"
        >
          Keep
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1 text-xs font-medium text-invalid hover:underline"
    >
      <Ban className="h-3.5 w-3.5" /> Cancel
    </button>
  );
}