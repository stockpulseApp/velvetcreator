"use client";

import { useState } from "react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"fan" | "creator">("fan");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("done");
      setMessage("You're on the list. We'll be in touch.");
      setEmail("");
    } else {
      setStatus("error");
      setMessage(data.error || "Something went wrong");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 text-left">
      <div className="flex gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] p-1">
        {(["fan", "creator"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex-1 rounded-full py-2 text-sm font-medium capitalize transition-colors ${
              role === r
                ? "bg-[var(--surface-hover)] text-[var(--text)]"
                : "text-[var(--muted)]"
            }`}
          >
            I&apos;m a {r}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="input flex-1"
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="btn btn-primary shrink-0"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Joining…" : "Join waitlist"}
        </button>
      </div>
      {message && (
        <p
          className={`text-center text-sm ${
            status === "error" ? "text-[var(--danger)]" : "text-[var(--success)]"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
