import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { formatMoney } from "@creator/shared";
import { StudioLayout } from "@/components/layout/StudioLayout";
import { TierForm } from "@/components/TierForm";

export default async function StudioTiersPage() {
  const session = await getSession();
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session!.userId },
    include: { subscriptionTiers: { orderBy: { sortOrder: "asc" } } },
  });
  if (!profile) return null;

  return (
    <StudioLayout
      title="Subscription tiers"
      subtitle="Fan memberships with perks — lower platform take than generic OF clones"
    >
      <TierForm />
      <div className="space-y-3">
        {profile.subscriptionTiers.map((t) => (
          <div key={t.id} className="card flex flex-wrap justify-between gap-4">
            <div>
              <p className="font-display text-lg text-[var(--accent-bright)]">
                {t.name}
              </p>
              <ul className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">
                {Object.entries(t.perks as Record<string, unknown>).map(
                  ([k, v]) => (
                    <li key={k}>
                      {k}: {String(v)}
                    </li>
                  )
                )}
              </ul>
            </div>
            <p className="font-display text-2xl">
              {formatMoney(t.priceCents)}
              <span className="text-sm text-[var(--muted)]">/mo</span>
            </p>
          </div>
        ))}
      </div>
    </StudioLayout>
  );
}
