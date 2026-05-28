import Link from "next/link";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-var(--header-h))]">
      <div className="grid min-h-full lg:grid-cols-2">
        <div className="hidden flex-col justify-between border-r border-[var(--border)] bg-[var(--surface)] p-12 lg:flex">
          <Link href="/" className="font-display text-2xl font-semibold">
            Velvet<span className="text-[var(--accent)]">Creator</span>
          </Link>
          <div>
            <blockquote className="font-display text-3xl font-medium leading-snug">
              &ldquo;Finally a platform that treats customs and shop like real
              revenue — not an afterthought.&rdquo;
            </blockquote>
            <p className="mt-4 text-sm text-[var(--muted)]">— Early creator partner</p>
          </div>
          <p className="text-xs text-[var(--muted)]">18+ · Consent-first · Creator-owned audience</p>
        </div>
        <div className="flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-md">
            <h1 className="font-display text-3xl font-semibold">{title}</h1>
            <p className="mt-2 text-[var(--text-secondary)]">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
