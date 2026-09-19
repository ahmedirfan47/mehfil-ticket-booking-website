"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";

export function VerificationReview({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);

  const act = async (approve: boolean) => {
    setBusy(approve ? "approve" : "reject");
    try {
      const res = await fetch("/api/verification/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approve }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Action failed.");
        return;
      }
      toast.success(approve ? "Organizer verified." : "Submission rejected.");
      router.refresh();
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => act(true)}
        disabled={busy !== null}
        className="inline-flex h-8 items-center gap-1 rounded-lg bg-valid/10 px-3 text-xs font-medium text-valid disabled:opacity-50"
      >
        {busy === "approve" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
        Approve
      </button>
      <button
        onClick={() => act(false)}
        disabled={busy !== null}
        className="inline-flex h-8 items-center gap-1 rounded-lg bg-invalid/10 px-3 text-xs font-medium text-invalid disabled:opacity-50"
      >
        {busy === "reject" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
        Reject
      </button>
    </div>
  );
}