"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Member = { user_id: string; full_name: string | null; email: string | null };

export function StaffManager({
  eventId,
  initial,
}: {
  eventId: string;
  initial: Member[];
}) {
  const [members, setMembers] = useState<Member[]>(initial);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error("Enter a valid email.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/events/${eventId}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not add staff.");
        return;
      }
      // Avoid duplicates in the UI.
      setMembers((prev) =>
        prev.some((m) => m.user_id === data.member.user_id) ? prev : [...prev, data.member]
      );
      setEmail("");
      toast.success("Staff member added.");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (userId: string) => {
    setRemoving(userId);
    try {
      const res = await fetch(`/api/events/${eventId}/staff`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not remove.");
        return;
      }
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
      toast.success("Removed.");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-mist bg-white p-5 shadow-card sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Add door staff</h2>
        <p className="mt-1 text-xs text-ink-muted">
          They need a Mehfil account with this email first. Once added, they can scan tickets for
          this listing at the staff portal.
        </p>
        <form onSubmit={add} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="staff-email">Staff email</Label>
            <Input
              id="staff-email"
              type="email"
              className="mt-1.5"
              placeholder="staff@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
            Add
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-mist bg-white p-5 shadow-card sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          Current staff ({members.length})
        </h2>
        {members.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">No staff added yet.</p>
        ) : (
          <div className="mt-4 divide-y divide-mist">
            {members.map((m) => (
              <div key={m.user_id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{m.full_name || m.email}</p>
                  {m.full_name && <p className="truncate text-xs text-ink-muted">{m.email}</p>}
                </div>
                <button
                  onClick={() => remove(m.user_id)}
                  disabled={removing === m.user_id}
                  className="inline-flex items-center gap-1 text-xs font-medium text-invalid hover:underline disabled:opacity-50"
                >
                  {removing === m.user_id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <X className="h-3.5 w-3.5" />
                  )}
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}