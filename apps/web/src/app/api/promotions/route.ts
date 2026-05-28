import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { createAndSettlePayment } from "@/lib/transactions";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!profile) {
    return NextResponse.json({ error: "Not a creator" }, { status: 403 });
  }

  const { tag, dailyBudgetCents, days } = await request.json();
  const budget = Math.max(500, Number(dailyBudgetCents) || 500);
  const duration = Math.min(30, Math.max(1, Number(days) || 1));
  const total = budget * duration;

  await createAndSettlePayment({
    transactionType: "platform_plan",
    grossCents: total,
    payerId: session.userId,
    payeeCreatorId: "platform",
    type: "platform_plan",
    metadata: { promotion: "true" },
  });

  const endsAt = new Date();
  endsAt.setDate(endsAt.getDate() + duration);

  const promo = await prisma.promotion.create({
    data: {
      creatorProfileId: profile.id,
      tag: tag || null,
      dailyBudgetCents: budget,
      startsAt: new Date(),
      endsAt,
      active: true,
    },
  });

  return NextResponse.json({ ok: true, promotionId: promo.id });
}
