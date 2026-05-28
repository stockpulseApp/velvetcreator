import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { getCreatorBalance } from "@/lib/transactions";
import { formatMoney } from "@creator/shared";
import { GoLiveForm } from "@/components/GoLiveForm";
import { AppContainer } from "@/components/layout/AppContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function StudioPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.userId },
    include: {
      _count: {
        select: {
          fanSubscriptions: true,
          customRequests: true,
          orders: true,
        },
      },
    },
  });

  if (!profile) redirect("/creator/apply");

  const balance = await getCreatorBalance(profile.id);

  const recentTx = await prisma.transaction.findMany({
    where: { payeeCreatorId: profile.id, status: "completed" },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <AppContainer wide>
    <div className="space-y-8">
      <PageHeader
        title="Studio"
        subtitle={`@${profile.handle} — your command center`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-sm text-[var(--muted)]">Available</p>
          <p className="text-2xl font-bold">{formatMoney(balance.availableCents)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--muted)]">In escrow</p>
          <p className="text-2xl font-bold">{formatMoney(balance.escrowCents)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-[var(--muted)]">Subscribers</p>
          <p className="text-2xl font-bold">{profile._count.fanSubscriptions}</p>
        </div>
      </div>

      <nav className="flex flex-wrap gap-3 text-sm">
        <Link href="/studio/earnings" className="btn btn-secondary btn-sm">
          Earnings
        </Link>
        <Link href="/studio/tiers" className="btn btn-secondary btn-sm">
          Tiers
        </Link>
        <Link href="/studio/shop" className="btn btn-secondary btn-sm">
          Shop
        </Link>
        <Link href="/studio/requests" className="btn btn-secondary btn-sm">
          Requests ({profile._count.customRequests})
        </Link>
        <Link href="/studio/orders" className="btn btn-secondary btn-sm">
          Orders
        </Link>
        <Link href="/studio/promote" className="btn btn-secondary btn-sm">
          Promote
        </Link>
      </nav>

      <div className="card">
        <h2 className="font-semibold">Go live</h2>
        <GoLiveForm />
      </div>

      <div className="card">
        <h2 className="font-semibold">Recent earnings</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {recentTx.map((tx) => (
            <li key={tx.id} className="flex justify-between border-b border-[var(--border)] py-2">
              <span className="capitalize">{tx.type.replace("_", " ")}</span>
              <span>{formatMoney(tx.creatorNetCents)}</span>
            </li>
          ))}
          {!recentTx.length && (
            <li className="text-[var(--muted)]">No transactions yet</li>
          )}
        </ul>
      </div>
    </div>
    </AppContainer>
  );
}
