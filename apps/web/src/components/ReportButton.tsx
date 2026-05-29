"use client";

import { useState } from "react";

const REASONS = [
  "Spam or scam",
  "Harassment",
  "Non-consensual content",
  "Underage concern",
  "Other",
];

export function ReportButton({
  targetType,
  targetId,
  label = "Report",
}: {
  targetType: string;
  targetId: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(reason: string) {
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, reason }),
    });
    setDone(true);
    setOpen(false);
  }

  if (done) {
    return <span className="text-xs text-[var(--muted)]">Reported</span>;
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm text-[var(--muted)]"
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="card max-w-sm w-full space-y-3">
            <h3 className="font-display text-lg">Report content</h3>
            <p className="text-sm text-[var(--muted)]">Why are you reporting this?</p>
            <ul className="space-y-2">
              {REASONS.map((r) => (
                <li key={r}>
                  <button
                    type="button"
                    className="btn btn-secondary w-full justify-start btn-sm"
                    onClick={() => submit(r)}
                  >
                    {r}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="btn btn-ghost w-full btn-sm"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
