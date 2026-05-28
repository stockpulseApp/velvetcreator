import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { createAndSettlePayment } from "@/lib/transactions";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.ageVerified) {
    return NextResponse.json({ error: "Age verification required" }, { status: 403 });
  }

  const { tierId } = await request.json();
  const tier = await prisma.subscriptionTier.findUnique({
    where: { id: tierId },
    include: { creator: true },
  });
  if (!tier?.active) {
    return NextResponse.json({ error: "Tier not found" }, { status: 404 });
  }

  const result = await createAndSettlePayment({
    transactionType: "subscription",
    grossCents: tier.priceCents,
    payerId: session.userId,
    payeeCreatorId: tier.creatorProfileId,
    type: "subscription",
    metadata: { tierId },
  });

  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await prisma.fanSubscription.upsert({
    where: {
      fanId_creatorProfileId: {
        fanId: session.userId,
        creatorProfileId: tier.creatorProfileId,
      },
    },
    create: {
      fanId: session.userId,
      tierId: tier.id,
      creatorProfileId: tier.creatorProfileId,
      status: "active",
      currentPeriodEnd: periodEnd,
      processorSubscriptionId: result.payment.externalId,
    },
    update: {
      tierId: tier.id,
      status: "active",
      currentPeriodEnd: periodEnd,
      processorSubscriptionId: result.payment.externalId,
    },
  });

  return NextResponse.json({ ok: true, transactionId: result.transaction.id });
}
