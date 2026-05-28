"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateListingForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fd.get("title"),
        description: fd.get("description"),
        priceCents: Math.round(Number(fd.get("price")) * 100),
        quantity: Number(fd.get("quantity")),
        shippingNotes: fd.get("shippingNotes"),
      }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card space-y-3">
      <h2 className="font-semibold">New listing</h2>
      <input className="input" name="title" placeholder="Title" required />
      <textarea className="input" name="description" placeholder="Description" required />
      <input className="input" name="price" type="number" min="1" step="0.01" placeholder="Price USD" required />
      <input className="input" name="quantity" type="number" min="1" defaultValue={1} />
      <input className="input" name="shippingNotes" placeholder="Shipping notes" />
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      <button type="submit" className="btn btn-primary">
        Publish listing
      </button>
    </form>
  );
}
