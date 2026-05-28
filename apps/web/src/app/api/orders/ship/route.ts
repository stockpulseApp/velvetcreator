import { NextResponse } from "next/server";
import { prisma } from "@creator/db";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId, trackingNumber } = await request.json();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { listing: { include: { creator: true } } },
  });

  if (!order || order.listing.creator.userId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "shipped", trackingNumber: trackingNumber || null },
  });

  return NextResponse.json({ ok: true });
}
