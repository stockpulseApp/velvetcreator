"use client";

import { useEffect, useState } from "react";

type Comment = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; displayName: string };
};

export function PostComments({
  postId,
  canComment,
}: {
  postId: string;
  canComment: boolean;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/comments?postId=${encodeURIComponent(postId)}`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []))
      .catch(() => {});
  }, [postId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setError(null);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, text }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed");
      return;
    }
    setComments((c) => [...c, { ...data.comment, createdAt: data.comment.createdAt }]);
    setText("");
  }

  return (
    <div className="mt-4 border-t border-[var(--border)] pt-4">
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
        Comments ({comments.length})
      </p>
      <ul className="mt-3 space-y-3">
        {comments.map((c) => (
          <li key={c.id} className="text-sm">
            <span className="font-medium text-[var(--accent-bright)]">
              {c.author.displayName}
            </span>
            <span className="ml-2 text-[var(--muted)]">
              {new Date(c.createdAt).toLocaleDateString()}
            </span>
            <p className="mt-1 text-[var(--text-secondary)]">{c.body}</p>
          </li>
        ))}
      </ul>
      {canComment && (
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <input
            className="input flex-1"
            placeholder="Add a comment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={2000}
          />
          <button type="submit" className="btn btn-secondary btn-sm">
            Post
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
