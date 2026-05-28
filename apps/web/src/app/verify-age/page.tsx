"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";

type Step = "dob" | "id" | "processing" | "done" | "error";

export default function VerifyAgePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("dob");
  const [dob, setDob] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");

  async function submitVerification() {
    setError(null);
    setStep("processing");
    setProgress("Checking date of birth…");

    const form = new FormData();
    form.set("dateOfBirth", dob);
    if (file) form.set("document", file);

    try {
      setProgress("Scanning ID document…");
      const res = await fetch("/api/kyc/verify", {
        method: "POST",
        body: form,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        setStep("error");
        return;
      }

      if (data.status === "processing" && data.sessionUrl) {
        setProgress("Redirecting to identity provider…");
        window.location.href = data.sessionUrl;
        return;
      }

      setProgress("Age verified — welcome in.");
      setStep("done");
      setTimeout(() => {
        router.push("/feed");
        router.refresh();
      }, 800);
    } catch {
      setError("Network error. Please try again.");
      setStep("error");
    }
  }

  function onDobNext() {
    if (!dob) {
      setError("Enter your date of birth");
      return;
    }
    const born = new Date(dob + "T12:00:00");
    const today = new Date();
    let age = today.getFullYear() - born.getFullYear();
    const hadBirthday =
      today.getMonth() > born.getMonth() ||
      (today.getMonth() === born.getMonth() && today.getDate() >= born.getDate());
    if (!hadBirthday) age--;
    if (age < 18) {
      setError("You must be at least 18");
      return;
    }
    setError(null);
    setStep("id");
  }

  return (
    <AuthShell
      title="Verify your age"
      subtitle="Automated 18+ check — date of birth plus government ID. Required before payments, DMs, or adult content."
    >
      {step === "dob" && (
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="dob">
              Date of birth
            </label>
            <input
              id="dob"
              type="date"
              className="input w-full"
              value={dob}
              max={new Date(
                new Date().setFullYear(new Date().getFullYear() - 18)
              )
                .toISOString()
                .slice(0, 10)}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <button type="button" className="btn btn-primary w-full" onClick={onDobNext}>
            Continue
          </button>
        </div>
      )}

      {step === "id" && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Upload a clear photo of your government ID (passport, driver license, or
            national ID). We hash the file — raw images are not stored in dev mode.
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="input w-full"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <button
            type="button"
            className="btn btn-primary w-full"
            disabled={!file}
            onClick={submitVerification}
          >
            Run automatic verification
          </button>
          <button
            type="button"
            className="btn btn-secondary w-full"
            onClick={() => setStep("dob")}
          >
            Back
          </button>
        </div>
      )}

      {step === "processing" && (
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
          <p className="font-display text-lg text-[var(--accent-bright)]">
            Verifying automatically
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">{progress}</p>
        </div>
      )}

      {step === "done" && (
        <div className="py-8 text-center">
          <p className="font-display text-2xl text-[var(--accent-bright)]">Verified</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Redirecting…</p>
        </div>
      )}

      {step === "error" && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--danger)]">{error}</p>
          <button
            type="button"
            className="btn btn-primary w-full"
            onClick={() => {
              setStep("dob");
              setError(null);
            }}
          >
            Try again
          </button>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-[var(--muted)]">
        Production uses Veriff/Yoti when API keys are configured. See{" "}
        <a href="/safety" className="text-[var(--accent-bright)] underline">
          Safety
        </a>
        .
      </p>
    </AuthShell>
  );
}
