import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { getCreatorBalance } from "@/lib/transactions";
import { formatMoney } from "@creator/shared";
import { transactionTypeLabel } from "@creator/ledger";
import { PayoutForm } from "@/components/PayoutForm";
import { StudioLayout } from "@/components/layout/StudioLayout";

export default async function StudioEarningsPage() {
  const session = await getSession();
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session!.userId },
  });
  if (!profile) return null;

  const balance = await getCreatorBalance(profile.id);

  const byType = await prisma.transaction.groupBy({
    by: ["type"],
    where: { payeeCreatorId: profile.id, status: "completed" },
    _sum: { creatorNetCents: true, platformFeeCents: true },
  });

  return (
    <StudioLayout
      title="Earnings"
      subtitle="Balance, payouts, and revenue by stream"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card-glass">
          <p className="text-sm text-[var(--muted)]">Available balance</p>
          <p className="mt-1 font-display text-4xl text-[var(--accent-bright)]">
            {formatMoney(balance.availableCents)}
          </p>
        </div>
        <div className="card">
          <PayoutForm maxCents={balance.availableCents} />
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="font-display text-lg text-[var(--accent-bright)]">
          By revenue stream
        </h2>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--muted)]">
              <th className="pb-2">Type</th>
              <th className="pb-2">Your net</th>
              <th className="pb-2">Platform fee</th>
            </tr>
          </thead>
          <tbody>
            {byType.map((row) => (
              <tr key={row.type} className="border-t border-[var(--border)]">
                <td className="py-2 capitalize">
                  {transactionTypeLabel(row.type)}
                </td>
                <td>{formatMoney(row._sum.creatorNetCents ?? 0)}</td>
                <td>{formatMoney(row._sum.platformFeeCents ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </StudioLayout>
  );
}
