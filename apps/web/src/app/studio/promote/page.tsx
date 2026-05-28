"use client";

import { useState } from "react";
import { StudioLayout } from "@/components/layout/StudioLayout";

export default function StudioPromotePage() {
  const [status, setStatus] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tag: fd.get("tag"),
        dailyBudgetCents: Math.round(Number(fd.get("budget")) * 100),
        days: Number(fd.get("days")),
      }),
    });
    if (res.ok)
      setStatus("Promotion scheduled — you appear in Explore promoted slots.");
    else {
      const data = await res.json();
      setStatus(data.error || "Failed");
    }
  }

  return (
    <StudioLayout
      title="Promote"
      subtitle="Featured placement in Discover — tag-targeted, daily budget"
    >
      <form onSubmit={submit} className="card max-w-md space-y-4">
        <input className="input" name="tag" placeholder="Tag (optional)" />
        <input
          className="input"
          name="budget"
          type="number"
          min="5"
          step="1"
          placeholder="Daily budget USD"
          defaultValue="10"
          required
        />
        <input
          className="input"
          name="days"
          type="number"
          min="1"
          max="30"
          defaultValue="3"
          required
        />
        <button type="submit" className="btn btn-primary w-full">
          Purchase promotion
        </button>
        {status && <p className="text-sm text-[var(--muted)]">{status}</p>}
      </form>
    </StudioLayout>
  );
}
