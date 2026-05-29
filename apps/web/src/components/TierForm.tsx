"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TierForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/tiers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        priceCents: Math.round(Number(fd.get("price")) * 100),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <h3 className="font-display text-lg">Add tier</h3>
      <div className="flex flex-wrap gap-3">
        <input name="name" className="input flex-1" placeholder="Bronze" required />
        <input
          name="price"
          type="number"
          min="1"
          step="0.01"
          className="input w-28"
          placeholder="9.99"
          required
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Add
        </button>
      </div>
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
    </form>
  );
}
