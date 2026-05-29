"use client";

import { useEffect, useState } from "react";

const MAX = 8;

function tagLabel(tag: string) {
  return tag.replace(/-/g, " ");
}

export function TagPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (tags: string[]) => void;
}) {
  const [popular, setPopular] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/fetishes/tags")
      .then((r) => r.json())
      .then((d) => setPopular(d.tags ?? []))
      .catch(() => setPopular([]));
  }, []);

  function toggle(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else if (selected.length < MAX) {
      onChange([...selected, tag]);
    }
  }

  return (
    <div>
      <p className="label mb-2">
        Fetish tags ({selected.length}/{MAX})
      </p>
      <div className="flex flex-wrap gap-2">
        {popular.map((tag) => {
          const on = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                on
                  ? "bg-[var(--rose)]/25 text-[var(--accent-bright)] ring-1 ring-[var(--rose)]/40"
                  : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              #{tagLabel(tag)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
