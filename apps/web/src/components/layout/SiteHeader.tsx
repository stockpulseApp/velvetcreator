import Link from "next/link";
import type { SessionPayload } from "@/lib/session";

type Props = {
  session: SessionPayload | null;
};

export function SiteHeader({ session }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl">
      <div className="container-wide flex h-[var(--header-h)] items-center justify-between gap-4">
        <Link href="/" className="group flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
            style={{
              background: "linear-gradient(135deg, var(--rose), var(--accent-deep))",
            }}
          >
            V
          </span>
          <span className="font-display text-xl font-semibold tracking-tight text-[var(--text)]">
            Velvet<span className="text-[var(--accent)]">Creator</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/explore" className="btn btn-ghost btn-sm">
            Discover
          </Link>
          <Link href="/fetishes" className="btn btn-ghost btn-sm">
            Fetishes
          </Link>
          <Link href="/for-creators" className="btn btn-ghost btn-sm">
            For creators
          </Link>
          {session ? (
            <>
              <Link href="/feed" className="btn btn-ghost btn-sm">
                Feed
              </Link>
              <Link href="/messages" className="btn btn-ghost btn-sm">
                Messages
              </Link>
              {(session.role === "creator" || session.role === "admin") && (
                <Link href="/studio" className="btn btn-ghost btn-sm">
                  Studio
                </Link>
              )}
              <Link href="/wallet" className="btn btn-secondary btn-sm">
                Wallet
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Join free
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {!session && (
            <Link href="/signup" className="btn btn-primary btn-sm">
              Join
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
