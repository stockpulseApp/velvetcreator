import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { formatMoney } from "@creator/shared";
import { ShipOrderButton } from "@/components/ShipOrderButton";
import { StudioLayout } from "@/components/layout/StudioLayout";

export default async function StudioOrdersPage() {
  const session = await getSession();
  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session!.userId },
  });
  if (!profile) return null;

  const orders = await prisma.order.findMany({
    where: { creatorProfileId: profile.id },
    include: { listing: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <StudioLayout title="Orders" subtitle="Ship physical items and track fulfillment">
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="card">
            <div className="flex justify-between gap-2">
              <p className="font-semibold">{o.listing.title}</p>
              <span className="badge badge-muted capitalize">{o.status}</span>
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {o.shippingLine1}, {o.shippingCity}, {o.shippingCountry}
            </p>
            <p className="mt-2 font-display text-xl text-[var(--accent-bright)]">
              {formatMoney(o.totalCents)}
            </p>
            {o.status === "paid" && <ShipOrderButton orderId={o.id} />}
            {o.trackingNumber && (
              <p className="mt-2 text-xs text-[var(--muted)]">
                Tracking: {o.trackingNumber}
              </p>
            )}
          </div>
        ))}
        {!orders.length && (
          <p className="text-[var(--muted)]">No orders yet</p>
        )}
      </div>
    </StudioLayout>
  );
}
