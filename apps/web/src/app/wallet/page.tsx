import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { formatMoney } from "@creator/shared";
import { AppContainer } from "@/components/layout/AppContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import Link from "next/link";

export default async function WalletPage() {
  const session = await getSession();
  if (!session) return null;

  const payments = await prisma.transaction.findMany({
    where: { payerId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { payeeCreator: { select: { handle: true } } },
  });

  const subs = await prisma.fanSubscription.findMany({
    where: { fanId: session.userId, status: "active" },
    include: { tier: true, creator: true },
  });

  return (
    <AppContainer>
      <PageHeader
        title="Wallet"
        subtitle="Subscriptions, purchases, and billing in one place"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="font-display text-lg text-[var(--accent-bright)]">
            Active subscriptions
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {subs.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3 last:border-0"
              >
                <Link
                  href={`/u/${s.creator.handle}`}
                  className="text-[var(--accent-bright)] hover:underline"
                >
                  @{s.creator.handle}
                </Link>
                <span className="text-[var(--text-secondary)]">{s.tier.name}</span>
                <span className="text-xs text-[var(--muted)]">
                  {s.currentPeriodEnd.toLocaleDateString()}
                </span>
              </li>
            ))}
            {!subs.length && (
              <li className="text-[var(--muted)]">
                No active subs —{" "}
                <Link href="/explore" className="text-[var(--accent-bright)]">
                  discover creators
                </Link>
              </li>
            )}
          </ul>
        </section>

        <section className="card">
          <h2 className="font-display text-lg text-[var(--accent-bright)]">
            Payment history
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            {payments.map((p) => (
              <li
                key={p.id}
                className="flex justify-between gap-3 border-b border-[var(--border)] py-2 last:border-0"
              >
                <span className="capitalize text-[var(--text-secondary)]">
                  {p.type.replace(/_/g, " ")}
                  {p.payeeCreator ? ` · @${p.payeeCreator.handle}` : ""}
                </span>
                <span className="font-medium">{formatMoney(p.grossCents)}</span>
              </li>
            ))}
            {!payments.length && (
              <li className="text-[var(--muted)]">No payments yet</li>
            )}
          </ul>
        </section>
      </div>

      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        <Link href="/settings/billing" className="text-[var(--accent-bright)]">
          Platform plans & billing →
        </Link>
      </p>
    </AppContainer>
  );
}
