"use client";

import { useState } from "react";
import { formatMoney } from "@creator/shared";

export function PayoutForm({ maxCents }: { maxCents: number }) {
  const [amount, setAmount] = useState(maxCents / 100);
  const [status, setStatus] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/payout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amountCents: Math.round(amount * 100),
        instant: true,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus(`Payout requested (fee ${formatMoney(data.feeCents ?? 0)})`);
    } else {
      setStatus(data.error || "Failed");
    }
  }

  if (maxCents < 1000) {
    return <p className="text-sm text-[var(--muted)]">Minimum balance $10 to withdraw.</p>;
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-sm font-semibold">Request payout</p>
      <input
        className="input"
        type="number"
        max={maxCents / 100}
        min={10}
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <button type="submit" className="btn btn-primary w-full">
        Withdraw (instant fee applies)
      </button>
      {status && <p className="text-xs text-[var(--muted)]">{status}</p>}
    </form>
  );
}
