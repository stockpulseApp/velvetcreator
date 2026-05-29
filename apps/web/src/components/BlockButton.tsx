"use client";

import { useState } from "react";

export function BlockButton({
  userId,
  label = "Block user",
}: {
  userId: string;
  label?: string;
}) {
  const [done, setDone] = useState(false);

  async function block() {
    if (!confirm("Block this user? You will not see each other's content or messages.")) {
      return;
    }
    await fetch("/api/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setDone(true);
  }

  if (done) {
    return <span className="text-xs text-[var(--muted)]">Blocked</span>;
  }

  return (
    <button type="button" className="btn btn-ghost btn-sm text-[var(--muted)]" onClick={block}>
      {label}
    </button>
  );
}
