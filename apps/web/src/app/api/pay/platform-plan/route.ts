import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { createAndSettlePayment } from "@/lib/transactions";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.ageVerified) {
    return NextResponse.json({ error: "Age verification required" }, { status: 403 });
  }

  const { planSlug } = await request.json();
  const plan = await prisma.platformPlan.findUnique({
    where: { slug: planSlug },
  });
  if (!plan?.active) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  await createAndSettlePayment({
    transactionType: "platform_plan",
    grossCents: plan.priceCents,
    payerId: session.userId,
    payeeCreatorId: "platform",
    type: "platform_plan",
    metadata: { planSlug },
  });

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  await prisma.userPlatformPlan.upsert({
    where: {
      userId_planId: { userId: session.userId, planId: plan.id },
    },
    create: {
      userId: session.userId,
      planId: plan.id,
      status: "active",
      expiresAt,
    },
    update: { status: "active", expiresAt },
  });

  if (planSlug === "creator_pro") {
    const profile = await prisma.creatorProfile.findUnique({
      where: { userId: session.userId },
    });
    if (profile) {
      await prisma.creatorProfile.update({
        where: { id: profile.id },
        data: { creatorProAt: new Date() },
      });
    }
  }

  if (planSlug === "fan_platform_plus") {
    await prisma.user.update({
      where: { id: session.userId },
      data: { fanPlatformPlusAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true });
}
