import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { formatMoney } from "@creator/shared";
import { CreateListingForm } from "@/components/CreateListingForm";
import { StudioLayout } from "@/components/layout/StudioLayout";

export default async function StudioShopPage() {
  const session = await getSession();
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session!.userId },
    include: { listings: { orderBy: { createdAt: "desc" } } },
  });
  if (!profile) return null;

  return (
    <StudioLayout
      title="Physical shop"
      subtitle="Worn items, prints, and fetish goods with marketplace commission"
    >
      <CreateListingForm />
      <div className="mt-6 space-y-3">
        {profile.listings.map((l) => (
          <div key={l.id} className="card flex justify-between gap-4">
            <div>
              <p className="font-semibold">{l.title}</p>
              <p className="text-sm text-[var(--muted)]">Qty: {l.quantity}</p>
            </div>
            <p className="font-display text-xl text-[var(--accent-bright)]">
              {formatMoney(l.priceCents)}
            </p>
          </div>
        ))}
        {!profile.listings.length && (
          <p className="text-sm text-[var(--muted)]">No listings yet</p>
        )}
      </div>
    </StudioLayout>
  );
}
