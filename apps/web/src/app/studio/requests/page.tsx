import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { formatMoney } from "@creator/shared";
import { RequestActions } from "@/components/RequestActions";
import { StudioLayout } from "@/components/layout/StudioLayout";

export default async function StudioRequestsPage() {
  const session = await getSession();
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session!.userId },
  });
  if (!profile) return null;

  const requests = await prisma.customRequest.findMany({
    where: { creatorProfileId: profile.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <StudioLayout
      title="Custom requests"
      subtitle="Paid commissions with escrow until delivery"
    >
      <div className="space-y-3">
        {requests.map((r) => (
          <div key={r.id} className="card">
            <div className="flex justify-between gap-2">
              <p className="font-semibold">{r.title}</p>
              <span className="badge badge-muted capitalize">{r.status}</span>
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {r.description}
            </p>
            <p className="mt-2 font-display text-xl text-[var(--accent-bright)]">
              {formatMoney(r.priceCents)}
            </p>
            {["paid", "accepted", "in_session"].includes(r.status) && (
              <RequestActions requestId={r.id} status={r.status} />
            )}
          </div>
        ))}
        {!requests.length && (
          <p className="text-[var(--muted)]">No requests yet</p>
        )}
      </div>
    </StudioLayout>
  );
}
