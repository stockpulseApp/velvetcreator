"use client";

import { useState } from "react";

export function LikeButton({ postId, count }: { postId: string; count: number }) {
  const [likes, setLikes] = useState(count);
  const [done, setDone] = useState(false);

  async function like() {
    if (done) return;
    await fetch("/api/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    setLikes((n) => n + 1);
    setDone(true);
  }

  return (
    <button type="button" onClick={like} className="hover:text-[var(--accent)]">
      ♥ {likes}
    </button>
  );
}
