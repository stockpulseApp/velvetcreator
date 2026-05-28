"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";

export default function CreatorApplyPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/creator/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        handle: fd.get("handle"),
        bio: fd.get("bio"),
        headline: fd.get("headline"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    router.push("/studio");
    router.refresh();
  }

  return (
    <AuthShell
      title="Become a creator"
      subtitle="Fetish-native profiles, tiers, shop, live, and escrow requests — built for your niche, not generic dating apps."
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="handle">
            Handle
          </label>
          <input
            className="input"
            id="handle"
            name="handle"
            placeholder="yourname"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="headline">
            Headline
          </label>
          <input
            className="input"
            id="headline"
            name="headline"
            placeholder="What fans should expect"
          />
        </div>
        <div>
          <label className="label" htmlFor="bio">
            Bio
          </label>
          <textarea
            className="input min-h-[100px]"
            id="bio"
            name="bio"
            placeholder="Tags, boundaries, and what you sell"
            required
          />
        </div>
        {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        <button type="submit" className="btn btn-primary w-full">
          Submit application
        </button>
      </form>
    </AuthShell>
  );
}
