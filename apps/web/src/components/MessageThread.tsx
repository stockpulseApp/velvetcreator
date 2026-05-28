"use client";

import { useState } from "react";
import { PayButton } from "./PayButton";
import { formatMoney } from "@creator/shared";

type Msg = { id: string; body: string; senderId: string; createdAt: string };

export function MessageThread({
  conversationId,
  creatorProfileId,
  currentUserId,
  unlockPriceCents,
  unlocked,
  initialMessages,
}: {
  conversationId: string;
  creatorProfileId: string;
  currentUserId: string;
  unlockPriceCents: number | null;
  unlocked: boolean;
  initialMessages: Msg[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (!body.trim() || sending) return;
    setSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, body }),
    });
    setSending(false);
    if (res.ok) {
      const trimmed = body.trim();
      setMessages((m) => [
        ...m,
        {
          id: `local-${Date.now()}`,
          body: trimmed,
          senderId: currentUserId,
          createdAt: new Date().toISOString(),
        },
      ]);
      setBody("");
    }
  }

  if (unlockPriceCents && !unlocked) {
    return (
      <div className="card-glass flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
        <p className="font-display text-xl text-[var(--accent-bright)]">
          Unlock DMs
        </p>
        <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
          This creator charges a one-time fee to open private messages. Subscribers
          may already have access via their tier.
        </p>
        <PayButton
          endpoint="/api/pay/dm-unlock"
          payload={{ conversationId }}
          label={`Unlock ${formatMoney(unlockPriceCents)}`}
          className="btn btn-primary mt-6"
        />
      </div>
    );
  }

  return (
    <div className="card flex min-h-[480px] flex-col p-0">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-[var(--radius)] px-4 py-2.5 text-sm ${
                  mine
                    ? "bg-[var(--accent)]/25 text-[var(--text-primary)]"
                    : "bg-[var(--surface-2)] text-[var(--text-secondary)]"
                }`}
              >
                {m.body}
              </div>
            </div>
          );
        })}
        {!messages.length && (
          <p className="text-center text-sm text-[var(--muted)]">
            Say hello — your messages are private.
          </p>
        )}
      </div>
      <div className="flex gap-2 border-t border-[var(--border)] p-4">
        <input
          className="input flex-1"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message…"
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          disabled={sending}
        />
        <button
          type="button"
          onClick={send}
          className="btn btn-primary"
          disabled={sending || !body.trim()}
        >
          {sending ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
