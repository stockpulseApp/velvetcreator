"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUnread(d?.unread ?? 0))
      .catch(() => {});
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative rounded-lg px-2 py-1 text-sm text-[var(--muted)] hover:text-[var(--text)]"
      aria-label="Notifications"
    >
      🔔
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--rose)] px-1 text-[10px] font-bold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
