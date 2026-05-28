"use client";

import { useState } from "react";

export function ShipOrderButton({ orderId }: { orderId: string }) {
  const [tracking, setTracking] = useState("");

  async function ship() {
    await fetch("/api/orders/ship", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, trackingNumber: tracking }),
    });
    window.location.reload();
  }

  return (
    <div className="mt-3 flex gap-2">
      <input
        className="input flex-1"
        placeholder="Tracking #"
        value={tracking}
        onChange={(e) => setTracking(e.target.value)}
      />
      <button type="button" className="btn btn-primary" onClick={ship}>
        Mark shipped
      </button>
    </div>
  );
}
