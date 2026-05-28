"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";

export default function VerifyAgePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function verify() {
    setError(null);
    const res = await fetch("/api/kyc/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: true }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Verification failed");
      return;
    }
    router.push("/feed");
    router.refresh();
  }

  return (
    <AuthShell
      title="Confirm your age"
      subtitle="VelvetCreator is 18+ only. Production uses certified ID verification; dev mode uses self-attestation."
    >
      <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius)] border border-[var(--border)] p-4">
        <input type="checkbox" id="confirm" className="mt-1" />
        <span className="text-sm text-[var(--text-secondary)]">
          I confirm I am at least 18 years old and agree to the{" "}
          <a href="/terms" className="text-[var(--accent-bright)] underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="/community" className="text-[var(--accent-bright)] underline">
            Community Guidelines
          </a>
          .
        </span>
      </label>
      {error && <p className="mt-4 text-sm text-[var(--danger)]">{error}</p>}
      <button
        type="button"
        className="btn btn-primary mt-6 w-full"
        onClick={() => {
          const el = document.getElementById("confirm") as HTMLInputElement;
          if (!el?.checked) {
            setError("Please confirm you are 18+");
            return;
          }
          verify();
        }}
      >
        Continue to VelvetCreator
      </button>
    </AuthShell>
  );
}
