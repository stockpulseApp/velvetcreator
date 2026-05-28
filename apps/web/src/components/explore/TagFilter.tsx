"use client";

import Link from "next/link";

export function TagFilter({ tags, active }: { tags: string[]; active?: string }) {
  return (
    <div className="mb-10 flex flex-wrap gap-2">
      <Link
        href="/explore"
        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          !active
            ? "bg-[var(--rose)]/20 text-[var(--accent-bright)]"
            : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]"
        }`}
      >
        All
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/explore?tag=${encodeURIComponent(tag)}`}
          className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${
            active === tag
              ? "bg-[var(--rose)]/20 text-[var(--accent-bright)]"
              : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]"
          }`}
        >
          #{tag}
        </Link>
      ))}
    </div>
  );
}
