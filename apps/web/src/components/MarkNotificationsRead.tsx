"use client";

import { useRouter } from "next/navigation";

export function MarkNotificationsRead() {
  const router = useRouter();

  async function markAll() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    router.refresh();
  }

  return (
    <button type="button" className="btn btn-secondary btn-sm" onClick={markAll}>
      Mark all read
    </button>
  );
}
