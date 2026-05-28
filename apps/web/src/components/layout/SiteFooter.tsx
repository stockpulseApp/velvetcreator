import Link from "next/link";

const links = {
  Product: [
    { href: "/explore", label: "Discover" },
    { href: "/fetishes", label: "Fetish catalog" },
    { href: "/for-creators", label: "For creators" },
    { href: "/signup?role=creator", label: "Start earning" },
  ],
  Trust: [
    { href: "/safety", label: "Safety" },
    { href: "/community", label: "Community guidelines" },
    { href: "/verify-age", label: "Age verification" },
  ],
  Legal: [
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--border)] bg-[var(--bg-elevated)]">
      <div className="container-wide py-16">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <p className="font-display text-2xl font-semibold">
              Velvet<span className="text-[var(--accent)]">Creator</span>
            </p>
            <p className="mt-3 max-w-sm text-sm text-[var(--text-secondary)]">
              A creator-first platform for fetish communities — subs, live, shop,
              and custom work with transparent economics.
            </p>
            <p className="mt-6 text-xs text-[var(--muted)]">
              18+ only. By using VelvetCreator you confirm you meet age requirements
              in your jurisdiction.
            </p>
          </div>
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                {title}
              </p>
              <ul className="mt-4 space-y-2">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border)] pt-8 text-xs text-[var(--muted)] md:flex-row">
          <span>© {new Date().getFullYear()} VelvetCreator. All rights reserved.</span>
          <span>Built for creators who outgrew a single subscription button.</span>
        </div>
      </div>
    </footer>
  );
}
