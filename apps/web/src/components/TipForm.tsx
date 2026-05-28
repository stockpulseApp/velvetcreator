"use client";

import { useState } from "react";

export function TipForm({
  creatorProfileId,
  minimum,
}: {
  creatorProfileId: string;
  minimum: number;
}) {
  const [amount, setAmount] = useState(minimum / 100);
  const [status, setStatus] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/pay/tip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creatorProfileId,
        amountCents: Math.round(amount * 100),
      }),
    });
    if (res.ok) {
      setStatus("Tip sent!");
    } else {
      const data = await res.json();
      setStatus(data.error || "Failed");
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 space-y-3">
      <input
        className="input"
        type="number"
        min={minimum / 100}
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <button type="submit" className="btn btn-primary w-full">
        Send tip
      </button>
      {status && <p className="text-sm text-[var(--muted)]">{status}</p>}
    </form>
  );
}
