"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@creator/shared";

const fanItems = [
  { href: "/feed", label: "Feed", icon: "⌂" },
  { href: "/explore", label: "Discover", icon: "◎" },
  { href: "/messages", label: "Chat", icon: "✉" },
  { href: "/wallet", label: "Wallet", icon: "◇" },
];

function isActive(pathname: string, href: string) {
  if (href === "/messages") {
    return pathname === "/messages" || pathname.startsWith("/messages/");
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export function MobileNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items =
    role === "creator" || role === "admin"
      ? [...fanItems.slice(0, 3), { href: "/studio", label: "Studio", icon: "★" }]
      : fanItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-xl md:hidden">
      <div className="flex items-stretch justify-around px-2 py-2">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2 text-[10px] font-medium transition-colors ${
                active
                  ? "text-[var(--accent-bright)]"
                  : "text-[var(--muted)]"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
