"use client";

import { useState } from "react";

export function CustomRequestForm({ creatorProfileId }: { creatorProfileId: string }) {
  const [status, setStatus] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/custom-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creatorProfileId,
        title: fd.get("title"),
        description: fd.get("description"),
        priceCents: Math.round(Number(fd.get("price")) * 100),
      }),
    });
    if (res.ok) setStatus("Request paid — held in escrow until complete.");
    else {
      const data = await res.json();
      setStatus(data.error || "Failed");
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-3">
      <input className="input" name="title" placeholder="Title" required />
      <textarea
        className="input min-h-[80px]"
        name="description"
        placeholder="What do you want?"
        required
      />
      <input
        className="input"
        name="price"
        type="number"
        min="5"
        step="0.01"
        placeholder="Price (USD)"
        required
      />
      <button type="submit" className="btn btn-primary w-full">
        Pay & submit request
      </button>
      {status && <p className="text-xs text-[var(--muted)]">{status}</p>}
    </form>
  );
}
