import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { getPlatformRevenue } from "@/lib/transactions";
import { formatMoney } from "@creator/shared";
import { AdminActions } from "@/components/AdminActions";
import { AppContainer } from "@/components/layout/AppContainer";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") return null;

  const platformRevenue = await getPlatformRevenue();
  const pendingCreators = await prisma.creatorApplication.findMany({
    where: { status: "pending" },
    include: { user: true },
  });
  const reports = await prisma.report.findMany({
    where: { status: "open" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const volume = await prisma.transaction.aggregate({
    where: { status: "completed" },
    _sum: { grossCents: true, platformFeeCents: true },
  });
  const waitlist = await prisma.waitlistEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <AppContainer wide>
      <PageHeader
        title="Operations"
        subtitle="Revenue, trust & safety, creator onboarding, launch waitlist"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-glass">
          <p className="text-sm text-[var(--muted)]">Platform revenue (ledger)</p>
          <p className="mt-1 font-display text-3xl text-[var(--accent-bright)]">
            {formatMoney(platformRevenue)}
          </p>
        </div>
        <div className="card-glass">
          <p className="text-sm text-[var(--muted)]">Gross volume</p>
          <p className="mt-1 font-display text-3xl text-[var(--accent-bright)]">
            {formatMoney(volume._sum.grossCents ?? 0)}
          </p>
        </div>
        <div className="card-glass">
          <p className="text-sm text-[var(--muted)]">Platform fees collected</p>
          <p className="mt-1 font-display text-3xl text-[var(--accent-bright)]">
            {formatMoney(volume._sum.platformFeeCents ?? 0)}
          </p>
        </div>
      </div>

      <section className="card mt-8">
        <h2 className="font-display text-lg text-[var(--accent-bright)]">
          Launch waitlist ({waitlist.length} shown)
        </h2>
        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto text-sm">
          {waitlist.map((w) => (
            <li
              key={w.id}
              className="flex justify-between gap-4 border-b border-[var(--border)] py-2"
            >
              <span>{w.email}</span>
              <span className="text-[var(--muted)]">
                {w.role ?? "fan"} · {w.createdAt.toLocaleDateString()}
              </span>
            </li>
          ))}
          {!waitlist.length && (
            <li className="text-[var(--muted)]">No signups yet</li>
          )}
        </ul>
      </section>

      <section className="card mt-6">
        <h2 className="font-display text-lg text-[var(--accent-bright)]">
          Creator applications
        </h2>
        <ul className="mt-4 space-y-3">
          {pendingCreators.map((app) => (
            <li
              key={app.id}
              className="flex flex-wrap items-center justify-between gap-2 text-sm"
            >
              <span>
                {app.user.displayName} ({app.user.email})
              </span>
              <AdminActions
                action="approve_creator"
                userId={app.userId}
                label="Approve"
              />
            </li>
          ))}
          {!pendingCreators.length && (
            <li className="text-[var(--muted)]">No pending applications</li>
          )}
        </ul>
      </section>

      <section className="card mt-6">
        <h2 className="font-display text-lg text-[var(--accent-bright)]">
          Open reports
        </h2>
        <ul className="mt-4 space-y-3 text-sm">
          {reports.map((r) => (
            <li key={r.id} className="flex justify-between gap-4">
              <span className="text-[var(--text-secondary)]">
                {r.targetType} / {r.targetId} — {r.reason}
              </span>
              <AdminActions
                action="resolve_report"
                reportId={r.id}
                label="Resolve"
              />
            </li>
          ))}
          {!reports.length && (
            <li className="text-[var(--muted)]">No open reports</li>
          )}
        </ul>
      </section>
    </AppContainer>
  );
}
