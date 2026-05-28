import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { createAndSettlePayment } from "@/lib/transactions";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.ageVerified) {
    return NextResponse.json({ error: "Age verification required" }, { status: 403 });
  }

  const { liveSessionId } = await request.json();
  const live = await prisma.liveSession.findUnique({
    where: { id: liveSessionId },
  });
  if (!live) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const cents = live.ticketPriceCents;
  if (cents > 0) {
    await createAndSettlePayment({
      transactionType: "live",
      grossCents: cents,
      payerId: session.userId,
      payeeCreatorId: live.creatorProfileId,
      type: "live",
      metadata: { liveSessionId },
    });
  }

  return NextResponse.json({ ok: true, roomName: live.roomName });
}
