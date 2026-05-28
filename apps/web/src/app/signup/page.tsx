"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const defaultRole = params.get("role") === "creator" ? "creator" : "fan";
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: fd.get("email"),
        password: fd.get("password"),
        displayName: fd.get("displayName"),
        role: fd.get("role"),
        referralCode: fd.get("referralCode") || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Signup failed");
      return;
    }
    router.push("/verify-age");
    router.refresh();
  }

  return (
    <AuthShell
      title={defaultRole === "creator" ? "Start earning" : "Join the community"}
      subtitle={
        defaultRole === "creator"
          ? "Apply as a creator — multi-stream monetization from day one."
          : "Follow creators, subscribe, and support what you love."
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="label" htmlFor="displayName">
            Display name
          </label>
          <input className="input" id="displayName" name="displayName" required />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input className="input" id="email" name="email" type="email" required />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            className="input"
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
          />
        </div>
        <div>
          <label className="label" htmlFor="role">
            I am joining as
          </label>
          <select className="input" id="role" name="role" defaultValue={defaultRole}>
            <option value="fan">Fan — support creators</option>
            <option value="creator">Creator — monetize my audience</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="referralCode">
            Referral code (optional)
          </label>
          <input className="input" id="referralCode" name="referralCode" placeholder="DEMOCREATOR" />
        </div>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button type="submit" className="btn btn-primary w-full">
          Create account
        </button>
        <p className="text-center text-xs text-[var(--muted)]">
          By signing up you agree to our{" "}
          <Link href="/terms" className="underline">
            Terms
          </Link>{" "}
          and confirm you are 18+.
        </p>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--accent-bright)] hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
