"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewMessageComposer({
  creatorProfileId,
  creatorHandle,
}: {
  creatorProfileId: string;
  creatorHandle: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError(null);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatorProfileId, body: body.trim() }),
    });
    const data = await res.json();
    setSending(false);
    if (!res.ok) {
      setError(data.error || "Could not send");
      return;
    }
    router.push(`/messages?conversation=${data.conversationId}`);
    router.refresh();
  }

  return (
    <div className="card">
      <p className="mb-3 text-sm text-[var(--muted)]">
        Start a conversation with @{creatorHandle}
      </p>
      <form onSubmit={send} className="flex gap-2">
        <input
          className="input flex-1"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Say hello…"
        />
        <button type="submit" className="btn btn-primary" disabled={sending}>
          Send
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-[var(--danger)]">{error}</p>}
    </div>
  );
}
