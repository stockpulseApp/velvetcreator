import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { createAndSettlePayment } from "@/lib/transactions";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.ageVerified) {
    return NextResponse.json({ error: "Age verification required" }, { status: 403 });
  }

  const { conversationId } = await request.json();
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });
  if (!conv?.unlockPriceCents) {
    return NextResponse.json({ error: "Not a paid thread" }, { status: 400 });
  }

  await createAndSettlePayment({
    transactionType: "paid_dm",
    grossCents: conv.unlockPriceCents,
    payerId: session.userId,
    payeeCreatorId: conv.creatorProfileId,
    type: "paid_dm",
    metadata: { conversationId },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { unlockedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
