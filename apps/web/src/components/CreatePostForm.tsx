"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreatePostForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const visibility = String(fd.get("visibility"));
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        body: fd.get("body"),
        visibility,
        ppvPriceCents:
          visibility === "ppv" ? Math.round(Number(fd.get("ppvPrice")) * 100) : undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to publish");
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <textarea
        name="body"
        className="input min-h-[100px] w-full"
        placeholder="What's new for your fans?"
        required
      />
      <div className="flex flex-wrap gap-4">
        <select name="visibility" className="input" defaultValue="public">
          <option value="public">Public teaser</option>
          <option value="subscribers">Subscribers only</option>
          <option value="ppv">PPV unlock</option>
        </select>
        <input
          name="ppvPrice"
          type="number"
          min="1"
          step="0.01"
          className="input w-32"
          placeholder="PPV $"
        />
      </div>
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
        {loading ? "Publishing…" : "Publish post"}
      </button>
    </form>
  );
}
