"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SearchBar({ size = "lg" }: { size?: "lg" | "sm" }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/events?q=${encodeURIComponent(query)}` : "/events");
  };

  return (
    <form
      onSubmit={submit}
      className={`flex w-full items-center gap-2 rounded-full border border-line bg-white p-1.5 shadow-card ${
        size === "lg" ? "max-w-2xl" : ""
      }`}
    >
      <span className="pl-3 text-ink-muted">
        <Search className="h-5 w-5" />
      </span>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search events, workshops, venues…"
        className="h-10 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
        aria-label="Search events"
      />
      <Button type="submit" size={size === "lg" ? "md" : "sm"}>
        Search
      </Button>
    </form>
  );
}