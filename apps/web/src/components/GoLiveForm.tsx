"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GoLiveForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fd.get("title"),
        ticketPriceCents: Math.round(Number(fd.get("ticket")) * 100),
        isPrivate: fd.get("private") === "on",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    router.push(`/live/${data.liveSessionId}`);
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3">
      <input className="input" name="title" placeholder="Stream title" required />
      <input
        className="input"
        name="ticket"
        type="number"
        min="0"
        step="0.01"
        placeholder="Ticket price USD (0 = free)"
        defaultValue="0"
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="private" /> Private room
      </label>
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      <button type="submit" className="btn btn-primary">
        Start live
      </button>
    </form>
  );
}
