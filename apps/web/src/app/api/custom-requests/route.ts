import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";
import { createAndSettlePayment, releaseCustomRequestEscrow } from "@/lib/transactions";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.ageVerified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { creatorProfileId, title, description, priceCents } =
    await request.json();

  const req = await prisma.customRequest.create({
    data: {
      fanId: session.userId,
      creatorProfileId,
      title,
      description,
      priceCents: Math.max(500, Number(priceCents) || 0),
      status: "draft",
    },
  });

  const payment = await createAndSettlePayment({
    transactionType: "custom_request",
    grossCents: req.priceCents,
    payerId: session.userId,
    payeeCreatorId: creatorProfileId,
    type: "custom_request",
    passEscrowFeeToFan: true,
    metadata: { customRequestId: String(req.id) },
  });

  await prisma.customRequest.update({
    where: { id: req.id },
    data: {
      status: "paid",
      transactionId: payment.transaction.id,
    },
  });

  return NextResponse.json({ ok: true, requestId: req.id });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { requestId, action } = await request.json();
  const req = await prisma.customRequest.findUnique({
    where: { id: requestId },
    include: { creator: true },
  });
  if (!req) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isCreator = req.creator.userId === session.userId;

  if (action === "accept" && isCreator && req.status === "paid") {
    await prisma.customRequest.update({
      where: { id: req.id },
      data: { status: "accepted" },
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "complete" && isCreator && ["accepted", "in_session"].includes(req.status)) {
    await prisma.customRequest.update({
      where: { id: req.id },
      data: { status: "completed" },
    });
    if (req.transactionId) {
      await releaseCustomRequestEscrow(
        req.transactionId,
        req.creatorProfileId,
        req.priceCents
      );
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
